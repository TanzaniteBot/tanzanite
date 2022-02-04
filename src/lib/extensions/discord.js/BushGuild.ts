import {
	banResponse,
	dmResponse,
	permissionsResponse,
	punishmentEntryRemove,
	type BanResponse,
	type BushClient,
	type BushGuildChannelManager,
	type BushGuildMember,
	type BushGuildMemberManager,
	type BushGuildMemberResolvable,
	type BushNewsChannel,
	type BushTextChannel,
	type BushThreadChannel,
	type BushUser,
	type BushUserResolvable,
	type GuildFeatures,
	type GuildLogType,
	type GuildModel
} from '#lib';
import { Collection, Guild, PermissionFlagsBits, Snowflake, type MessageOptions, type MessagePayload } from 'discord.js';
import type { RawGuildData } from 'discord.js/typings/rawDataTypes';
import _ from 'lodash';
import { Moderation } from '../../common/util/Moderation.js';
import { Guild as GuildDB } from '../../models/instance/Guild.js';
import { ModLogType } from '../../models/instance/ModLog.js';

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with {@link BushGuild.available}.</info>
 */
export class BushGuild extends Guild {
	public declare readonly client: BushClient;
	public declare readonly me: BushGuildMember | null;
	public declare members: BushGuildMemberManager;
	public declare channels: BushGuildChannelManager;

	public constructor(client: BushClient, data: RawGuildData) {
		super(client, data);
	}

	/**
	 * Checks if the guild has a certain custom feature.
	 * @param feature The feature to check for
	 */
	public async hasFeature(feature: GuildFeatures): Promise<boolean> {
		const features = await this.getSetting('enabledFeatures');
		return features.includes(feature);
	}

	/**
	 * Adds a custom feature to the guild.
	 * @param feature The feature to add
	 * @param moderator The moderator responsible for adding a feature
	 */
	public async addFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('add', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	/**
	 * Removes a custom feature from the guild.
	 * @param feature The feature to remove
	 * @param moderator The moderator responsible for removing a feature
	 */
	public async removeFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('remove', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	/**
	 * Makes a custom feature the opposite of what it was before
	 * @param feature The feature to toggle
	 * @param moderator The moderator responsible for toggling a feature
	 */
	public async toggleFeature(feature: GuildFeatures, moderator?: BushGuildMember): Promise<GuildModel['enabledFeatures']> {
		return (await this.hasFeature(feature))
			? await this.removeFeature(feature, moderator)
			: await this.addFeature(feature, moderator);
	}

	/**
	 * Fetches a custom setting for the guild
	 * @param setting The setting to get
	 */
	public async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		return (
			client.cache.guilds.get(this.id)?.[setting] ??
			((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id }))[setting]
		);
	}

	/**
	 * Sets a custom setting for the guild
	 * @param setting The setting to change
	 * @param value The value to change the setting to
	 * @param moderator The moderator to responsible for changing the setting
	 */
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

	/**
	 * Get a the log channel configured for a certain log type.
	 * @param logType The type of log channel to get.
	 * @returns Either the log channel or undefined if not configured.
	 */
	public async getLogChannel(logType: GuildLogType): Promise<BushTextChannel | undefined> {
		const channelId = (await this.getSetting('logChannels'))[logType];
		if (!channelId) return undefined;
		return (
			(this.channels.cache.get(channelId) as BushTextChannel | undefined) ??
			((await this.channels.fetch(channelId)) as BushTextChannel | null) ??
			undefined
		);
	}

	/**
	 * Sends a message to the guild's specified logging channel
	 * @param logType The corresponding channel that the message will be sent to
	 * @param message The parameters for {@link BushTextChannel.send}
	 */
	public async sendLogChannel(logType: GuildLogType, message: string | MessagePayload | MessageOptions) {
		const logChannel = await this.getLogChannel(logType);
		if (!logChannel || !logChannel.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(this.me!.id)
				?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks])
		)
			return;

		return await logChannel.send(message).catch(() => null);
	}

	/**
	 * Sends a formatted error message in a guild's error log channel
	 * @param title The title of the error embed
	 * @param message The description of the error embed
	 */
	public async error(title: string, message: string) {
		void client.console.info(_.camelCase(title), message.replace(/\*\*(.*?)\*\*/g, '<<$1>>'));
		void this.sendLogChannel('error', { embeds: [{ title: title, description: message, color: util.colors.error }] });
	}

	/**
	 * Bans a user, dms them, creates a mod log entry, and creates a punishment entry.
	 * @param options Options for banning the user.
	 * @returns A string status message of the ban.
	 */
	public async bushBan(options: GuildBushBanOptions): Promise<BanResponse> {
		// checks
		if (!this.me!.permissions.has(PermissionFlagsBits.BanMembers)) return banResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const user = await util.resolveNonCachedUser(options.user);
		const moderator = client.users.resolve(options.moderator ?? client.user!);
		if (!user || !moderator) return banResponse.CANNOT_RESOLVE_USER;

		if ((await this.bans.fetch()).has(user.id)) return banResponse.ALREADY_BANNED;

		const ret = await (async () => {
			// dm user
			dmSuccessEvent = await Moderation.punishDM({
				guild: this,
				user: user,
				punishment: 'banned',
				duration: options.duration ?? 0,
				reason: options.reason ?? undefined,
				sendFooter: true
			});

			// ban
			const banSuccess = await this.bans
				.create(user?.id ?? options.user, {
					reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
					days: options.deleteDays
				})
				.catch(() => false);
			if (!banSuccess) return banResponse.ACTION_ERROR;

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
			if (!modlog) return banResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
				type: 'ban',
				user: user,
				guild: this,
				duration: options.duration,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			if (!dmSuccessEvent) return banResponse.DM_ERROR;
			return banResponse.SUCCESS;
		})();

		if (!([banResponse.ACTION_ERROR, banResponse.MODLOG_ERROR, banResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret))
			client.emit(
				'bushBan',
				user,
				moderator,
				this,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccessEvent,
				options.evidence
			);
		return ret;
	}

	/**
	 * Unbans a user, dms them, creates a mod log entry, and destroys the punishment entry.
	 * @param options Options for unbanning the user.
	 * @returns A status message of the unban.
	 */
	public async bushUnban(options: GuildBushUnbanOptions): Promise<UnbanResponse> {
		// checks
		if (!this.me!.permissions.has(PermissionFlagsBits.BanMembers)) return unbanResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const user = await util.resolveNonCachedUser(options.user);
		const moderator = client.users.resolve(options.moderator ?? client.user!);
		if (!user || !moderator) return unbanResponse.CANNOT_RESOLVE_USER;

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

			if (notBanned) return unbanResponse.NOT_BANNED;
			if (!unbanSuccess) return unbanResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.UNBAN,
				user: user.id,
				moderator: moderator.id,
				reason: options.reason,
				guild: this,
				evidence: options.evidence
			});
			if (!modlog) return unbanResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// remove punishment entry
			const removePunishmentEntrySuccess = await Moderation.removePunishmentEntry({
				type: 'ban',
				user: user.id,
				guild: this
			});
			if (!removePunishmentEntrySuccess) return unbanResponse.PUNISHMENT_ENTRY_REMOVE_ERROR;

			// dm user
			dmSuccessEvent = await Moderation.punishDM({
				guild: this,
				user: user,
				punishment: 'unbanned',
				reason: options.reason ?? undefined,
				sendFooter: false
			});

			if (!dmSuccessEvent) return unbanResponse.DM_ERROR;
			return unbanResponse.SUCCESS;
		})();
		if (
			!([unbanResponse.ACTION_ERROR, unbanResponse.MODLOG_ERROR, unbanResponse.PUNISHMENT_ENTRY_REMOVE_ERROR] as const).includes(
				ret
			)
		)
			client.emit('bushUnban', user, moderator, this, options.reason ?? undefined, caseID!, dmSuccessEvent!, options.evidence);
		return ret;
	}

	/**
	 * Denies send permissions in specified channels
	 * @param options The options for locking down the guild
	 */
	public async lockdown(options: LockdownOptions): Promise<LockdownResponse> {
		if (!options.all && !options.channel) return 'all not chosen and no channel specified';
		const channelIds = options.all ? await this.getSetting('lockdownChannels') : [options.channel!.id];

		if (!channelIds.length) return 'no channels configured';
		const mappedChannels = channelIds.map((id) => this.channels.cache.get(id));

		const invalidChannels = mappedChannels.filter((c) => c === undefined);
		if (invalidChannels.length) return `invalid channel configured: ${invalidChannels.join(', ')}`;

		const moderator = this.members.resolve(options.moderator);
		if (!moderator) return 'moderator not found';

		const errors = new Collection<Snowflake, Error>();
		const success = new Collection<Snowflake, boolean>();
		const ret = await (async (): Promise<LockdownResponse> => {
			for (const _channel of mappedChannels) {
				const channel = _channel!;
				if (!channel.isText() && !channel.isThread()) {
					errors.set(channel.id, new Error('wrong channel type'));
					success.set(channel.id, false);
					continue;
				}
				if (!channel.permissionsFor(this.me!.id)?.has([PermissionFlagsBits.ManageChannels])) {
					errors.set(channel.id, new Error('client no permission'));
					success.set(channel.id, false);
					continue;
				} else if (!channel.permissionsFor(moderator)?.has([PermissionFlagsBits.ManageChannels])) {
					errors.set(channel.id, new Error('moderator no permission'));
					success.set(channel.id, false);
					continue;
				}

				const reason = `[${options.unlock ? 'Unlockdown' : 'Lockdown'}] ${moderator.user.tag} | ${
					options.reason ?? 'No reason provided'
				}`;

				const permissionOverwrites = channel.isThread() ? channel.parent!.permissionOverwrites : channel.permissionOverwrites;
				const perms = {
					SendMessagesInThreads: options.unlock ? null : false,
					SendMessages: options.unlock ? null : false
				};
				const permsForMe = {
					[channel.isThread() ? 'SendMessagesInThreads' : 'SendMessages']: options.unlock ? null : true
				}; // so I can send messages in the channel

				const changePermSuccess = await permissionOverwrites.edit(this.id, perms, { reason }).catch((e) => e);
				if (changePermSuccess instanceof Error) {
					errors.set(channel.id, changePermSuccess);
					success.set(channel.id, false);
				} else {
					success.set(channel.id, true);
					await permissionOverwrites.edit(this.me!, permsForMe, { reason });
					await channel.send({
						embeds: [
							{
								author: { name: moderator.user.tag, icon_url: moderator.displayAvatarURL() },
								title: `This channel has been ${options.unlock ? 'un' : ''}locked`,
								description: options.reason ?? 'No reason provided',
								color: options.unlock ? util.colors.GREEN : util.colors.RED,
								timestamp: new Date().toISOString()
							}
						]
					});
				}
			}

			if (errors.size) return errors;
			else return `success: ${success.filter((c) => c === true).size}`;
		})();

		client.emit(options.unlock ? 'bushUnlockdown' : 'bushLockdown', moderator, options.reason, success, options.all);
		return ret;
	}
}

/**
 * Options for unbanning a user
 */
export interface GuildBushUnbanOptions {
	/**
	 * The user to unban
	 */
	user: BushUserResolvable | BushUser;

	/**
	 * The reason for unbanning the user
	 */
	reason?: string | null;

	/**
	 * The moderator who unbanned the user
	 */
	moderator?: BushUserResolvable;

	/**
	 * The evidence for the unban
	 */
	evidence?: string;
}

/**
 * Options for banning a user
 */
export interface GuildBushBanOptions {
	/**
	 * The user to ban
	 */
	user: BushUserResolvable;

	/**
	 * The reason to ban the user
	 */
	reason?: string | null;

	/**
	 * The moderator who banned the user
	 */
	moderator?: BushUserResolvable;

	/**
	 * The duration of the ban
	 */
	duration?: number;

	/**
	 * The number of days to delete the user's messages for
	 */
	deleteDays?: number;

	/**
	 * The evidence for the ban
	 */
	evidence?: string;
}

type ValueOf<T> = T[keyof T];

export const unbanResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...punishmentEntryRemove,
	NOT_BANNED: 'user not banned'
} as const);

/**
 * Response returned when unbanning a user
 */
export type UnbanResponse = ValueOf<typeof unbanResponse>;

/**
 * Options for locking down channel(s)
 */
export interface LockdownOptions {
	/**
	 * The moderator responsible for the lockdown
	 */
	moderator: BushGuildMemberResolvable;

	/**
	 * Whether to lock down all (specified) channels
	 */
	all: boolean;

	/**
	 * Reason for the lockdown
	 */
	reason?: string;

	/**
	 * A specific channel to lockdown
	 */
	channel?: BushThreadChannel | BushNewsChannel | BushTextChannel;

	/**
	 * Whether or not to unlock the channel(s) instead of locking them
	 */
	unlock?: boolean;
}

/**
 * Response returned when locking down a channel
 */
export type LockdownResponse =
	| `success: ${number}`
	| 'all not chosen and no channel specified'
	| 'no channels configured'
	| `invalid channel configured: ${string}`
	| 'moderator not found'
	| Collection<string, Error>;
