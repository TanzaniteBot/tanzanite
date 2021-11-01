import type {
	BushClient,
	BushGuildMember,
	BushGuildMemberManager,
	BushTextChannel,
	BushUser,
	BushUserResolvable,
	GuildFeatures,
	GuildLogType,
	GuildModel
} from '#lib';
import { Guild, type MessageOptions, type UserResolvable } from 'discord.js';
import type { RawGuildData } from 'discord.js/typings/rawDataTypes';
import { Moderation } from '../../common/Moderation.js';
import { Guild as GuildDB } from '../../models/Guild.js';
import { ModLogType } from '../../models/ModLog.js';

export class BushGuild extends Guild {
	public declare readonly client: BushClient;
	public declare readonly me: BushGuildMember | null;
	public declare members: BushGuildMemberManager;
	public constructor(client: BushClient, data: RawGuildData) {
		super(client, data);
	}

	public async hasFeature(feature: GuildFeatures): Promise<boolean> {
		const features = await this.getSetting('enabledFeatures');
		return features.includes(feature);
	}

	public async addFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('add', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	public async removeFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('remove', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	public async toggleFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		return (await this.hasFeature(feature))
			? await this.removeFeature(feature, moderator)
			: await this.addFeature(feature, moderator);
	}

	public async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		return (
			client.cache.guilds.get(this.id)?.[setting] ??
			((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id }))[setting]
		);
	}

	public async setSetting<K extends Exclude<keyof GuildModel, 'id'>>(
		setting: K,
		value: GuildDB[K],
		moderator?: BushGuildMember
	): Promise<GuildDB> {
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		const oldValue = row[setting] as GuildDB[K];
		row[setting] = value;
		client.cache.guilds.set(this.id, row.toJSON() as GuildDB);
		client.emit('bushUpdateSettings', setting, this, oldValue, row[setting], moderator);
		return await row.save();
	}

	public async getLogChannel(logType: GuildLogType): Promise<BushTextChannel | undefined> {
		const channelId = (await this.getSetting('logChannels'))[logType];
		if (!channelId) return undefined;
		return (
			(this.channels.cache.get(channelId) as BushTextChannel | undefined) ??
			((await this.channels.fetch(channelId)) as BushTextChannel | null) ??
			undefined
		);
	}

	public async bushBan(options: {
		user: BushUserResolvable | UserResolvable;
		reason?: string | null;
		moderator?: BushUserResolvable;
		duration?: number;
		deleteDays?: number;
		evidence?: string;
	}): Promise<'success' | 'missing permissions' | 'error banning' | 'error creating modlog entry' | 'error creating ban entry'> {
		// checks
		if (!this.me!.permissions.has('BAN_MEMBERS')) return 'missing permissions';

		let caseID: string | undefined = undefined;
		const user = (await util.resolveNonCachedUser(options.user))!;
		const moderator = (await util.resolveNonCachedUser(options.moderator!)) ?? client.user!;

		const ret = await (async () => {
			await this.members.cache.get(user.id)?.punishDM('banned', options.reason, options.duration ?? 0);

			// ban
			const banSuccess = await this.bans
				.create(user?.id ?? options.user, {
					reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
					days: options.deleteDays
				})
				.catch(() => false);
			if (!banSuccess) return 'error banning';

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_BAN : ModLogType.PERM_BAN,
				user: user,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this,
				evidence: options.evidence
			});
			if (!modlog) return 'error creating modlog entry';
			caseID = modlog.id;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
				type: 'ban',
				user: user,
				guild: this,
				duration: options.duration,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return 'error creating ban entry';

			return 'success';
		})();

		if (!['error banning', 'error creating modlog entry', 'error creating ban entry'].includes(ret))
			client.emit('bushBan', user, moderator, this, options.reason ?? undefined, caseID!, options.duration ?? 0);
		return ret;
	}

	public async bushUnban(options: {
		user: BushUserResolvable | BushUser;
		reason?: string | null;
		moderator?: BushUserResolvable;
	}): Promise<
		| 'success'
		| 'missing permissions'
		| 'user not banned'
		| 'error unbanning'
		| 'error creating modlog entry'
		| 'error removing ban entry'
	> {
		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const user = (await util.resolveNonCachedUser(options.user))!;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.me))!;

		const ret = await (async () => {
			const bans = await this.bans.fetch();

			let notBanned = false;
			if (!bans.has(user.id)) notBanned = true;

			const unbanSuccess = await this.bans
				.remove(user, `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch((e) => {
					if (e?.code === 'UNKNOWN_BAN') {
						notBanned = true;
						return true;
					} else return false;
				});

			if (notBanned) return 'user not banned';
			if (!unbanSuccess) return 'error unbanning';

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.UNBAN,
				user: user.id,
				moderator: moderator.id,
				reason: options.reason,
				guild: this
			});
			if (!modlog) return 'error creating modlog entry';
			caseID = modlog.id;

			// remove punishment entry
			const removePunishmentEntrySuccess = await Moderation.removePunishmentEntry({
				type: 'ban',
				user: user.id,
				guild: this
			});
			if (!removePunishmentEntrySuccess) return 'error removing ban entry';

			const userObject = client.users.cache.get(user.id);

			const dmSuccess = await userObject
				?.send(`You have been unbanned from **${this}** for **${options.reason ?? 'No reason provided'}**.`)
				.catch(() => false);
			dmSuccessEvent = !!dmSuccess;

			return 'success';
		})();
		if (!['error unbanning', 'error creating modlog entry', 'error removing ban entry'].includes(ret))
			client.emit('bushUnban', user, moderator, this, options.reason ?? undefined, caseID!, dmSuccessEvent!);
		return ret;
	}

	/**
	 * Sends a message to the guild's specified logging channel.
	 */
	public async sendLogChannel(logType: GuildLogType, message: MessageOptions) {
		const logChannel = await this.getLogChannel(logType);
		if (!logChannel || logChannel.type !== 'GUILD_TEXT') return;
		if (!logChannel.permissionsFor(this.me!.id)?.has(['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS'])) return;

		return await logChannel.send(message).catch(() => null);
	}
}
