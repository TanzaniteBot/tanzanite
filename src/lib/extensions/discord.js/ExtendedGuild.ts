import {
	AllowedMentions,
	banResponse,
	dmResponse,
	permissionsResponse,
	punishmentEntryRemove,
	type BanResponse,
	type GuildFeatures,
	type GuildLogType,
	type GuildModel
} from '#lib';
import {
	AttachmentBuilder,
	AttachmentPayload,
	Collection,
	Guild,
	JSONEncodable,
	Message,
	MessageType,
	PermissionFlagsBits,
	SnowflakeUtil,
	ThreadChannel,
	type APIMessage,
	type GuildMember,
	type GuildMemberResolvable,
	type GuildTextBasedChannel,
	type MessageOptions,
	type MessagePayload,
	type NewsChannel,
	type Snowflake,
	type TextChannel,
	type User,
	type UserResolvable,
	type VoiceChannel,
	type Webhook,
	type WebhookMessageOptions
} from 'discord.js';
import _ from 'lodash';
import { Moderation } from '../../common/util/Moderation.js';
import { Guild as GuildDB } from '../../models/instance/Guild.js';
import { ModLogType } from '../../models/instance/ModLog.js';

declare module 'discord.js' {
	export interface Guild {
		/**
		 * Checks if the guild has a certain custom feature.
		 * @param feature The feature to check for
		 */
		hasFeature(feature: GuildFeatures): Promise<boolean>;
		/**
		 * Adds a custom feature to the guild.
		 * @param feature The feature to add
		 * @param moderator The moderator responsible for adding a feature
		 */
		addFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildDB['enabledFeatures']>;
		/**
		 * Removes a custom feature from the guild.
		 * @param feature The feature to remove
		 * @param moderator The moderator responsible for removing a feature
		 */
		removeFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildDB['enabledFeatures']>;
		/**
		 * Makes a custom feature the opposite of what it was before
		 * @param feature The feature to toggle
		 * @param moderator The moderator responsible for toggling a feature
		 */
		toggleFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildDB['enabledFeatures']>;
		/**
		 * Fetches a custom setting for the guild
		 * @param setting The setting to get
		 */
		getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]>;
		/**
		 * Sets a custom setting for the guild
		 * @param setting The setting to change
		 * @param value The value to change the setting to
		 * @param moderator The moderator to responsible for changing the setting
		 */
		setSetting<K extends Exclude<keyof GuildModel, 'id'>>(
			setting: K,
			value: GuildModel[K],
			moderator?: GuildMember
		): Promise<GuildModel>;
		/**
		 * Get a the log channel configured for a certain log type.
		 * @param logType The type of log channel to get.
		 * @returns Either the log channel or undefined if not configured.
		 */
		getLogChannel(logType: GuildLogType): Promise<TextChannel | undefined>;
		/**
		 * Sends a message to the guild's specified logging channel
		 * @param logType The corresponding channel that the message will be sent to
		 * @param message The parameters for {@link BushTextChannel.send}
		 */
		sendLogChannel(logType: GuildLogType, message: string | MessagePayload | MessageOptions): Promise<Message | null | undefined>;
		/**
		 * Sends a formatted error message in a guild's error log channel
		 * @param title The title of the error embed
		 * @param message The description of the error embed
		 */
		error(title: string, message: string): Promise<void>;
		/**
		 * Bans a user, dms them, creates a mod log entry, and creates a punishment entry.
		 * @param options Options for banning the user.
		 * @returns A string status message of the ban.
		 */
		bushBan(options: GuildBushBanOptions): Promise<BanResponse>;
		/**
		 * {@link bushBan} with less resolving and checks
		 * @param options Options for banning the user.
		 * @returns A string status message of the ban.
		 * **Preconditions:**
		 * - {@link me} has the `BanMembers` permission
		 * **Warning:**
		 * - Doesn't emit bushBan Event
		 */
		massBanOne(options: GuildMassBanOneOptions): Promise<BanResponse>;
		/**
		 * Unbans a user, dms them, creates a mod log entry, and destroys the punishment entry.
		 * @param options Options for unbanning the user.
		 * @returns A status message of the unban.
		 */
		bushUnban(options: GuildBushUnbanOptions): Promise<UnbanResponse>;
		/**
		 * Denies send permissions in specified channels
		 * @param options The options for locking down the guild
		 */
		lockdown(options: LockdownOptions): Promise<LockdownResponse>;
		quote(rawQuote: APIMessage, channel: GuildTextBasedChannel): Promise<Message | null>;
	}
}

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with {@link ExtendedGuild.available}.</info>
 */
export class ExtendedGuild extends Guild {
	/**
	 * Checks if the guild has a certain custom feature.
	 * @param feature The feature to check for
	 */
	public override async hasFeature(feature: GuildFeatures): Promise<boolean> {
		const features = await this.getSetting('enabledFeatures');
		return features.includes(feature);
	}

	/**
	 * Adds a custom feature to the guild.
	 * @param feature The feature to add
	 * @param moderator The moderator responsible for adding a feature
	 */
	public override async addFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('add', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	/**
	 * Removes a custom feature from the guild.
	 * @param feature The feature to remove
	 * @param moderator The moderator responsible for removing a feature
	 */
	public override async removeFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = util.addOrRemoveFromArray('remove', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	/**
	 * Makes a custom feature the opposite of what it was before
	 * @param feature The feature to toggle
	 * @param moderator The moderator responsible for toggling a feature
	 */
	public override async toggleFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		return (await this.hasFeature(feature))
			? await this.removeFeature(feature, moderator)
			: await this.addFeature(feature, moderator);
	}

	/**
	 * Fetches a custom setting for the guild
	 * @param setting The setting to get
	 */
	public override async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
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
	public override async setSetting<K extends Exclude<keyof GuildModel, 'id'>>(
		setting: K,
		value: GuildDB[K],
		moderator?: GuildMember
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
	public override async getLogChannel(logType: GuildLogType): Promise<TextChannel | undefined> {
		const channelId = (await this.getSetting('logChannels'))[logType];
		if (!channelId) return undefined;
		return (
			(this.channels.cache.get(channelId) as TextChannel | undefined) ??
			((await this.channels.fetch(channelId)) as TextChannel | null) ??
			undefined
		);
	}

	/**
	 * Sends a message to the guild's specified logging channel
	 * @param logType The corresponding channel that the message will be sent to
	 * @param message The parameters for {@link BushTextChannel.send}
	 */
	public override async sendLogChannel(
		logType: GuildLogType,
		message: string | MessagePayload | MessageOptions
	): Promise<Message | null | undefined> {
		const logChannel = await this.getLogChannel(logType);
		if (!logChannel || !logChannel.isTextBased()) return;
		if (
			!logChannel
				.permissionsFor(this.members.me!.id)
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
	public override async error(title: string, message: string): Promise<void> {
		void client.console.info(_.camelCase(title), message.replace(/\*\*(.*?)\*\*/g, '<<$1>>'));
		void this.sendLogChannel('error', { embeds: [{ title: title, description: message, color: util.colors.error }] });
	}

	/**
	 * Bans a user, dms them, creates a mod log entry, and creates a punishment entry.
	 * @param options Options for banning the user.
	 * @returns A string status message of the ban.
	 */
	public override async bushBan(options: GuildBushBanOptions): Promise<BanResponse> {
		// checks
		if (!this.members.me!.permissions.has(PermissionFlagsBits.BanMembers)) return banResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const user = await util.resolveNonCachedUser(options.user);
		const moderator = client.users.resolve(options.moderator ?? client.user!);
		if (!user || !moderator) return banResponse.CANNOT_RESOLVE_USER;

		if ((await this.bans.fetch()).has(user.id)) return banResponse.ALREADY_BANNED;

		const ret = await (async () => {
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

			// dm user
			dmSuccessEvent = await Moderation.punishDM({
				modlog: modlog.id,
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
					deleteMessageDays: options.deleteDays
				})
				.catch(() => false);
			if (!banSuccess) return banResponse.ACTION_ERROR;

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
	 * {@link bushBan} with less resolving and checks
	 * @param options Options for banning the user.
	 * @returns A string status message of the ban.
	 * **Preconditions:**
	 * - {@link me} has the `BanMembers` permission
	 * **Warning:**
	 * - Doesn't emit bushBan Event
	 */
	public override async massBanOne(options: GuildMassBanOneOptions): Promise<BanResponse> {
		if (this.bans.cache.has(options.user)) return banResponse.ALREADY_BANNED;

		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntrySimple({
				type: ModLogType.PERM_BAN,
				user: options.user,
				moderator: options.moderator,
				reason: options.reason,
				duration: 0,
				guild: this.id
			});
			if (!modlog) return banResponse.MODLOG_ERROR;

			let dmSuccessEvent: boolean | undefined = undefined;
			// dm user
			if (this.members.cache.has(options.user)) {
				dmSuccessEvent = await Moderation.punishDM({
					modlog: modlog.id,
					guild: this,
					user: options.user,
					punishment: 'banned',
					duration: 0,
					reason: options.reason ?? undefined,
					sendFooter: true
				});
			}

			// ban
			const banSuccess = await this.bans
				.create(options.user, {
					reason: `${options.moderator} | ${options.reason}`,
					deleteMessageDays: options.deleteDays
				})
				.catch(() => false);
			if (!banSuccess) return banResponse.ACTION_ERROR;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
				type: 'ban',
				user: options.user,
				guild: this,
				duration: 0,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			if (!dmSuccessEvent) return banResponse.DM_ERROR;
			return banResponse.SUCCESS;
		})();
		return ret;
	}

	/**
	 * Unbans a user, dms them, creates a mod log entry, and destroys the punishment entry.
	 * @param options Options for unbanning the user.
	 * @returns A status message of the unban.
	 */
	public override async bushUnban(options: GuildBushUnbanOptions): Promise<UnbanResponse> {
		// checks
		if (!this.members.me!.permissions.has(PermissionFlagsBits.BanMembers)) return unbanResponse.MISSING_PERMISSIONS;

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
	public override async lockdown(options: LockdownOptions): Promise<LockdownResponse> {
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
				if (!channel.isTextBased()) {
					errors.set(channel.id, new Error('wrong channel type'));
					success.set(channel.id, false);
					continue;
				}
				if (!channel.permissionsFor(this.members.me!.id)?.has([PermissionFlagsBits.ManageChannels])) {
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
					await permissionOverwrites.edit(this.members.me!, permsForMe, { reason });
					await channel.send({
						embeds: [
							{
								author: { name: moderator.user.tag, icon_url: moderator.displayAvatarURL() },
								title: `This channel has been ${options.unlock ? 'un' : ''}locked`,
								description: options.reason ?? 'No reason provided',
								color: options.unlock ? util.colors.Green : util.colors.Red,
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

	public override async quote(rawQuote: APIMessage, channel: GuildTextBasedChannel): Promise<Message | null> {
		if (!channel.isTextBased() || channel.isDMBased() || channel.guildId !== this.id || !this.members.me) return null;
		if (!channel.permissionsFor(this.members.me).has('ManageWebhooks')) return null;

		const quote = new Message(client, rawQuote);

		const target = channel instanceof ThreadChannel ? channel.parent : channel;
		if (!target) return null;

		const webhooks: Collection<string, Webhook> = await target.fetchWebhooks().catch((e) => e);
		if (!(webhooks instanceof Collection)) return null;

		// find a webhook that we can use
		let webhook = webhooks.find((w) => !!w.token) ?? null;
		if (!webhook)
			webhook = await target
				.createWebhook({
					name: `${client.user!.username} Quotes #${target.name}`,
					avatar: client.user!.displayAvatarURL({ size: 2048 }),
					reason: 'Creating a webhook for quoting'
				})
				.catch(() => null);

		if (!webhook) return null;

		const sendOptions: Omit<WebhookMessageOptions, 'flags'> = {};

		const displayName = quote.member?.displayName ?? quote.author.username;

		switch (quote.type) {
			case MessageType.Default:
			case MessageType.Reply:
			case MessageType.ChatInputCommand:
			case MessageType.ContextMenuCommand:
			case MessageType.ThreadStarterMessage:
				sendOptions.content = quote.content || undefined;
				sendOptions.threadId = channel instanceof ThreadChannel ? channel.id : undefined;
				sendOptions.embeds = quote.embeds.length ? quote.embeds : undefined;
				//@ts-expect-error: jank
				sendOptions.attachments = quote.attachments.size
					? [...quote.attachments.values()].map((a) => AttachmentBuilder.from(a as JSONEncodable<AttachmentPayload>))
					: undefined;

				if (quote.stickers.size && !(quote.content || quote.embeds.length || quote.attachments.size))
					sendOptions.content = '[[This message has a sticker but not content]]';

				break;
			case MessageType.RecipientAdd: {
				const recipient = rawQuote.mentions[0];
				if (!recipient) {
					sendOptions.content = `${util.emojis.error} Cannot resolve recipient.`;
					break;
				}

				if (quote.channel.isThread()) {
					const recipientDisplay = quote.guild?.members.cache.get(recipient.id)?.displayName ?? recipient.username;
					sendOptions.content = `${util.emojis.join} ${displayName} added ${recipientDisplay} to the thread.`;
				} else {
					// this should never happen
					sendOptions.content = `${util.emojis.join} ${displayName} added ${recipient.username} to the group.`;
				}

				break;
			}
			case MessageType.RecipientRemove: {
				const recipient = rawQuote.mentions[0];
				if (!recipient) {
					sendOptions.content = `${util.emojis.error} Cannot resolve recipient.`;
					break;
				}

				if (quote.channel.isThread()) {
					const recipientDisplay = quote.guild?.members.cache.get(recipient.id)?.displayName ?? recipient.username;
					sendOptions.content = `${util.emojis.leave} ${displayName} removed ${recipientDisplay} from the thread.`;
				} else {
					// this should never happen
					sendOptions.content = `${util.emojis.leave} ${displayName} removed ${recipient.username} from the group.`;
				}

				break;
			}

			case MessageType.ChannelNameChange:
				sendOptions.content = `<:pencil:957988608994861118> ${displayName} changed the channel name: **${quote.content}**`;

				break;

			case MessageType.ChannelPinnedMessage:
				throw new Error('Not implemented yet: MessageType.ChannelPinnedMessage case');
			case MessageType.GuildMemberJoin: {
				const messages = [
					'{username} joined the party.',
					'{username} is here.',
					'Welcome, {username}. We hope you brought pizza.',
					'A wild {username} appeared.',
					'{username} just landed.',
					'{username} just slid into the server.',
					'{username} just showed up!',
					'Welcome {username}. Say hi!',
					'{username} hopped into the server.',
					'Everyone welcome {username}!',
					"Glad you're here, {username}.",
					'Good to see you, {username}.',
					'Yay you made it, {username}!'
				];

				const timestamp = SnowflakeUtil.timestampFrom(quote.id);

				// this is the same way that the discord client decides what message to use.
				const message = messages[timestamp % messages.length].replace(/{username}/g, displayName);

				sendOptions.content = `${util.emojis.join} ${message}`;
				break;
			}
			case MessageType.UserPremiumGuildSubscription:
				sendOptions.content = `<:NitroBoost:585558042309820447> ${displayName} just boosted the server${
					quote.content ? ` **${quote.content}** times` : ''
				}!`;

				break;
			case MessageType.UserPremiumGuildSubscriptionTier1:
			case MessageType.UserPremiumGuildSubscriptionTier2:
			case MessageType.UserPremiumGuildSubscriptionTier3:
				sendOptions.content = `<:NitroBoost:585558042309820447> ${displayName} just boosted the server${
					quote.content ? ` **${quote.content}** times` : ''
				}! ${quote.guild?.name} has achieved **Level ${quote.type - 8}!**`;

				break;
			case MessageType.ChannelFollowAdd:
				sendOptions.content = `${displayName} has added **${quote.content}** to this channel. Its most important updates will show up here.`;

				break;
			case MessageType.GuildDiscoveryDisqualified:
				sendOptions.content =
					'<:SystemMessageCross:842172192418693173> This server has been removed from Server Discovery because it no longer passes all the requirements. Check Server Settings for more details.';

				break;
			case MessageType.GuildDiscoveryRequalified:
				sendOptions.content =
					'<:SystemMessageCheck:842172191801212949> This server is eligible for Server Discovery again and has been automatically relisted!';

				break;
			case MessageType.GuildDiscoveryGracePeriodInitialWarning:
				sendOptions.content =
					'<:SystemMessageWarn:842172192401915971> This server has failed Discovery activity requirements for 1 week. If this server fails for 4 weeks in a row, it will be automatically removed from Discovery.';

				break;
			case MessageType.GuildDiscoveryGracePeriodFinalWarning:
				sendOptions.content =
					'<:SystemMessageWarn:842172192401915971> This server has failed Discovery activity requirements for 3 weeks in a row. If this server fails for 1 more week, it will be removed from Discovery.';

				break;
			case MessageType.ThreadCreated: {
				const threadId = rawQuote.message_reference?.channel_id;

				sendOptions.content = `<:thread:865033845753249813> ${displayName} started a thread: **[${quote.content}](https://discord.com/channels/${quote.guildId}/${threadId}
				)**. See all threads.`;

				break;
			}
			case MessageType.GuildInviteReminder:
				sendOptions.content = 'Wondering who to invite? Start by inviting anyone who can help you build the server!';

				break;
			case MessageType.ChannelIconChange:
			case MessageType.Call:
			default:
				sendOptions.content = `${util.emojis.error} I cannot quote **${
					MessageType[quote.type] || quote.type
				}** messages, please report this to my developers.`;

				break;
		}

		sendOptions.allowedMentions = AllowedMentions.none();
		sendOptions.username = quote.member?.displayName ?? quote.author.username;
		sendOptions.avatarURL = quote.member?.displayAvatarURL({ size: 2048 }) ?? quote.author.displayAvatarURL({ size: 2048 });

		return await webhook.send(sendOptions); /* .catch((e: any) => e); */
	}
}

/**
 * Options for unbanning a user
 */
export interface GuildBushUnbanOptions {
	/**
	 * The user to unban
	 */
	user: UserResolvable | User;

	/**
	 * The reason for unbanning the user
	 */
	reason?: string | null;

	/**
	 * The moderator who unbanned the user
	 */
	moderator?: UserResolvable;

	/**
	 * The evidence for the unban
	 */
	evidence?: string;
}

export interface GuildMassBanOneOptions {
	/**
	 * The user to ban
	 */
	user: Snowflake;

	/**
	 * The reason to ban the user
	 */
	reason: string;

	/**
	 * The moderator who banned the user
	 */
	moderator: Snowflake;

	/**
	 * The number of days to delete the user's messages for
	 */
	deleteDays?: number;
}

/**
 * Options for banning a user
 */
export interface GuildBushBanOptions {
	/**
	 * The user to ban
	 */
	user: UserResolvable;

	/**
	 * The reason to ban the user
	 */
	reason?: string | null;

	/**
	 * The moderator who banned the user
	 */
	moderator?: UserResolvable;

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
	moderator: GuildMemberResolvable;

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
	channel?: ThreadChannel | NewsChannel | TextChannel | VoiceChannel;

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
