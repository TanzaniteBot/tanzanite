import { Guild, UserResolvable } from 'discord.js';
import { RawGuildData } from 'discord.js/typings/rawDataTypes';
import { Guild as GuildDB, GuildFeatures, GuildModel } from '../../models/Guild';
import { ModLogType } from '../../models/ModLog';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuildMember } from './BushGuildMember';
import { BushGuildMemberManager } from './BushGuildMemberManager';
import { BushUser } from './BushUser';

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

	public async addFeature(feature: GuildFeatures): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('add', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures)).enabledFeatures;
	}

	public async removeFeature(feature: GuildFeatures): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('remove', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures)).enabledFeatures;
	}

	public async toggleFeature(feature: GuildFeatures): Promise<GuildModel['enabledFeatures']> {
		return (await this.hasFeature(feature)) ? await this.removeFeature(feature) : await this.addFeature(feature);
	}

	public async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		// client.console.debug(`getSetting: ${setting}`);
		return (
			client.cache.guilds.get(this.id)?.[setting] ??
			((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id }))[setting]
		);
	}

	public async setSetting<K extends keyof GuildModel>(setting: K, value: GuildDB[K]): Promise<GuildDB> {
		// client.console.debug(`setSetting: ${setting}`);
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		row[setting] = value;
		client.cache.guilds.set(this.id, row.toJSON() as GuildDB);
		return await row.save();
	}

	public async ban(options: {
		user: BushUserResolvable | UserResolvable;
		reason?: string | null;
		moderator?: BushUserResolvable;
		duration?: number;
		deleteDays?: number;
	}): Promise<
		'success' | 'missing permissions' | 'error banning' | 'error creating modlog entry' | 'error creating ban entry'
	> {
		// checks
		if (!this.me!.permissions.has('BAN_MEMBERS')) return 'missing permissions';

		const moderator = (await util.resolveNonCachedUser(options.moderator!)) ?? client.user!;

		// ban
		const banSuccess = await this.bans
			.create(options.user, {
				reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
				days: options.deleteDays
			})
			.catch(() => false);
		if (!banSuccess) return 'error banning';

		// add modlog entry
		const { log: modlog } = await util.createModLogEntry({
			type: options.duration ? ModLogType.TEMP_BAN : ModLogType.PERM_BAN,
			user: options.user as BushUserResolvable,
			moderator: moderator.id,
			reason: options.reason,
			duration: options.duration,
			guild: this
		});
		if (!modlog) return 'error creating modlog entry';

		// add punishment entry so they can be unbanned later
		const punishmentEntrySuccess = await util.createPunishmentEntry({
			type: 'ban',
			user: options.user as BushUserResolvable,
			guild: this,
			duration: options.duration,
			modlog: modlog.id
		});
		if (!punishmentEntrySuccess) return 'error creating ban entry';

		return 'success';
	}

	public async unban(options: {
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
		const user = (await util.resolveNonCachedUser(options.user))!;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.me))!;

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

		if (!unbanSuccess) return 'error unbanning';

		// add modlog entry
		const modlog = await util.createModLogEntry({
			type: ModLogType.UNBAN,
			user: user.id,
			moderator: moderator.id,
			reason: options.reason,
			guild: this
		});
		if (!modlog) return 'error creating modlog entry';

		// remove punishment entry
		const removePunishmentEntrySuccess = await util.removePunishmentEntry({
			type: 'ban',
			user: user.id,
			guild: this
		});
		if (!removePunishmentEntrySuccess) return 'error removing ban entry';

		const userObject = client.users.cache.get(user.id);

		userObject?.send(`You have been unbanned from **${this}** for **${options.reason ?? 'No reason provided'}**.`);

		if (notBanned) return 'user not banned';
		return 'success';
	}
}
