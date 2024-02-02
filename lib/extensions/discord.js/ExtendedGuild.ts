import {
	Action,
	createModLogEntry,
	createModLogEntrySimple,
	createPunishmentEntry,
	punishDM,
	removePunishmentEntry
} from '#lib/common/Moderation.js';
import { AllowedMentions } from '#lib/utils/AllowedMentions.js';
import { TanzaniteEvent, colors, emojis } from '#lib/utils/Constants.js';
import { addOrRemoveFromArray, format } from '#lib/utils/Utils.js';
import { Guild as GuildDB, ModLogType, type GuildFeatures, type GuildLogType, type GuildModel } from '#models';
import {
	AttachmentBuilder,
	Collection,
	Guild,
	Message,
	MessageType,
	PermissionFlagsBits,
	SnowflakeUtil,
	ThreadChannel,
	type APIEmbed,
	type APIMessage,
	type AttachmentPayload,
	type GuildMember,
	type GuildMemberResolvable,
	type GuildTextBasedChannel,
	type JSONEncodable,
	type MessageCreateOptions,
	type MessagePayload,
	type NewsChannel,
	type Snowflake,
	type TextChannel,
	type User,
	type UserResolvable,
	type VoiceChannel,
	type Webhook,
	type WebhookMessageCreateOptions
} from 'discord.js';
import { camelCase } from 'lodash-es';
import assert from 'node:assert/strict';
import { TanzaniteClient } from '../discord-akairo/TanzaniteClient.js';
import { banResponse, dmResponse, permissionsResponse, punishmentEntryError, type BanResponse } from './ExtendedGuildMember.js';

interface Extension {
	/**
	 * Checks if the guild has a certain custom feature.
	 * @param feature The feature to check for
	 */
	hasFeature(feature: GuildFeatures): Promise<boolean>;
	/**
	 * Checks if the guild has a certain custom features.
	 * @param feature The features to check for
	 */
	hasFeatures(...feature: GuildFeatures[]): Promise<boolean>;
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
	 * @param message The parameters for {@link TextChannel.send}
	 */
	sendLogChannel(logType: GuildLogType, message: string | MessagePayload | MessageCreateOptions): Promise<Message | false>;
	/**
	 * Sends embed(s) to the guild's specified logging channel
	 * @param logType The corresponding channel that the message will be sent to
	 * @param embeds The embeds to send
	 * @param components The components to send
	 */
	sendLogEmbeds(logType: GuildLogType, embeds: EmbedsResolvable, components?: ComponentsResolvable): Promise<Message | false>;
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
	customBan(options: GuildCustomBanOptions): Promise<BanResponse>;
	/**
	 * {@link customBan} with less resolving and checks
	 * @param options Options for banning the user.
	 * @returns A string status message of the ban.
	 * **Preconditions:**
	 * - {@link members.me} has the `BanMembers` permission
	 * **Warning:**
	 * - Doesn't emit customBan Event
	 */
	massBanOne(options: GuildMassBanOneOptions): Promise<BanResponse>;
	/**
	 * Unbans a user, dms them, creates a mod log entry, and destroys the punishment entry.
	 * @param options Options for unbanning the user.
	 * @returns A status message of the unban.
	 */
	customUnban(options: GuildCustomUnbanOptions): Promise<UnbanResponse>;
	/**
	 * Denies send permissions in specified channels
	 * @param options The options for locking down the guild
	 */
	lockdown(options: LockdownOptions): Promise<LockdownResponse>;
	/**
	 * Reposts a message with a webhook
	 * @param rawQuote The original message to repost
	 * @param channel The channel to repost the message in
	 */
	quote(rawQuote: APIMessage, channel: GuildTextBasedChannel): Promise<Message | null>;
}

declare module 'discord.js' {
	export interface BaseGuild {
		client: TanzaniteClient<true>;
	}

	export interface Guild extends AnonymousGuild, Extension {}
}

type OrArray<T> = T | T[];
type EmbedsResolvable = OrArray<NonNullable<MessageCreateOptions['embeds']>[number]>;
type ComponentsResolvable = OrArray<NonNullable<MessageCreateOptions['components']>[number]>;

/**
 * Represents a guild (or a server) on Discord.
 * <info>It's recommended to see if a guild is available before performing operations or reading data from it. You can
 * check this with {@link ExtendedGuild.available}.</info>
 */
export class ExtendedGuild extends Guild implements Extension {
	public override async hasFeature(feature: GuildFeatures): Promise<boolean> {
		const enabledFeatures = await this.getSetting('enabledFeatures');
		return enabledFeatures.includes(feature);
	}

	public override async hasFeatures(...feature: GuildFeatures[]): Promise<boolean> {
		const enabledFeatures = await this.getSetting('enabledFeatures');
		return feature.every((f) => enabledFeatures.includes(f));
	}

	public override async addFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = addOrRemoveFromArray('add', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	public override async removeFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		const features = await this.getSetting('enabledFeatures');
		const newFeatures = addOrRemoveFromArray('remove', features, feature);
		return (await this.setSetting('enabledFeatures', newFeatures, moderator)).enabledFeatures;
	}

	public override async toggleFeature(feature: GuildFeatures, moderator?: GuildMember): Promise<GuildModel['enabledFeatures']> {
		return (await this.hasFeature(feature))
			? await this.removeFeature(feature, moderator)
			: await this.addFeature(feature, moderator);
	}

	public override async getSetting<K extends keyof GuildModel>(setting: K): Promise<GuildModel[K]> {
		return (
			this.client.cache.guilds.get(this.id)?.[setting] ??
			((await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id }))[setting]
		);
	}

	public override async setSetting<K extends Exclude<keyof GuildModel, 'id'>>(
		setting: K,
		value: GuildDB[K],
		moderator?: GuildMember
	): Promise<GuildDB> {
		const row = (await GuildDB.findByPk(this.id)) ?? GuildDB.build({ id: this.id });
		const oldValue = row[setting] as GuildDB[K];
		row[setting] = value;
		this.client.cache.guilds.set(this.id, row.toJSON() as GuildDB);
		this.client.emit(TanzaniteEvent.UpdateSettings, setting, this, oldValue, row[setting], moderator);
		return await row.save();
	}

	public override async getLogChannel(logType: GuildLogType): Promise<TextChannel | undefined> {
		const channelId = (await this.getSetting('logChannels'))[logType];
		if (!channelId) return undefined;
		return (
			(this.channels.cache.get(channelId) as TextChannel | undefined) ??
			((await this.channels.fetch(channelId)) as TextChannel | null) ??
			undefined
		);
	}

	public override async sendLogChannel(
		logType: GuildLogType,
		options: string | MessagePayload | MessageCreateOptions
	): Promise<Message | false> {
		const logChannel = await this.getLogChannel(logType);
		if (!logChannel || !logChannel.isTextBased()) {
			if (logType === 'error') {
				void this.client.console.warn('sendLogChannel', `No log channel found for <<${logType}<< in <<${this.name}>>.`, false);

				await this.client.console.channelError({
					embeds: [
						{
							description: `**[sendLogChannel]** No log channel found for **${logType}** in ${format.bold(this.name)}`,
							color: colors.warn,
							timestamp: new Date().toISOString()
						},
						...(typeof options == 'object' && 'embeds' in options && options.embeds ? options.embeds! : <APIEmbed[]>[])
					]
				});
			} else {
				void this.client.console.warn('sendLogChannel', `No log channel found for <<${logType}<< in <<${this.name}>>.`);
			}

			return false;
		}
		if (
			!logChannel
				.permissionsFor(this.members.me!.id)
				?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks] as const)
		)
			return false;

		return await logChannel.send(options).catch(() => false);
	}

	public override async sendLogEmbeds(
		logType: GuildLogType,
		embeds: EmbedsResolvable,
		components: ComponentsResolvable = []
	): Promise<Message | false> {
		const embedsArr = Array.isArray(embeds) ? embeds : [embeds];
		const componentsArr = Array.isArray(components) ? components : [components];

		return this.sendLogChannel(logType, { embeds: embedsArr, components: componentsArr });
	}

	public override async error(title: string, message: string): Promise<void> {
		void this.client.console.info(camelCase(title), message.replace(/\*\*(.*?)\*\*/g, '<<$1>>'));
		void this.sendLogChannel('error', { embeds: [{ title: title, description: message, color: colors.error }] });
	}

	public override async customBan(options: GuildCustomBanOptions): Promise<BanResponse> {
		// checks
		if (!this.members.me!.permissions.has(PermissionFlagsBits.BanMembers)) return banResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const user = await this.client.utils.resolveNonCachedUser(options.user);
		const moderator = this.client.users.resolve(options.moderator ?? this.client.user!);
		if (!user || !moderator) return banResponse.CannotResolveUser;

		const alreadyBanned = await this.bans.fetch(user).catch(() => false);
		if (alreadyBanned) return banResponse.AlreadyBanned;

		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TempBan : ModLogType.PermBan,
				user: user,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this,
				evidence: options.evidence
			});
			if (!modlog) return banResponse.ModlogError;
			caseID = modlog.id;

			if (!options.noDM) {
				// dm user
				dmSuccess = await punishDM({
					client: this.client,
					modlog: modlog.id,
					guild: this,
					user: user,
					punishment: Action.Ban,
					duration: options.duration ?? 0,
					reason: options.reason ?? undefined,
					sendFooter: true
				});
			}

			// ban
			const banSuccess = await this.bans
				.create(user?.id ?? options.user, {
					reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
					deleteMessageSeconds: options.deleteMessageSeconds
				})
				.catch(() => false);
			if (!banSuccess) return banResponse.ActionError;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'ban',
				user: user,
				guild: this,
				duration: options.duration,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PunishmentEntryError;

			if (!options.noDM && !dmSuccess) {
				return banResponse.DmError;
			}

			return banResponse.Success;
		})();

		if (!([banResponse.ActionError, banResponse.ModlogError, banResponse.PunishmentEntryError] as const).includes(ret))
			this.client.emit(
				TanzaniteEvent.Ban,
				user,
				moderator,
				this,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async massBanOne(options: GuildMassBanOneOptions): Promise<BanResponse> {
		if (this.bans.cache.has(options.user)) return banResponse.AlreadyBanned;

		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await createModLogEntrySimple({
				client: this.client,
				type: ModLogType.PermBan,
				user: options.user,
				moderator: options.moderator,
				reason: options.reason,
				duration: 0,
				guild: this.id
			});
			if (!modlog) return banResponse.ModlogError;

			let dmSuccessEvent: boolean | undefined = undefined;
			// dm user
			if (this.members.cache.has(options.user)) {
				dmSuccessEvent = await punishDM({
					client: this.client,
					modlog: modlog.id,
					guild: this,
					user: options.user,
					punishment: Action.Ban,
					duration: 0,
					reason: options.reason ?? undefined,
					sendFooter: true
				});
			}

			// ban
			const banSuccess = await this.bans
				.create(options.user, {
					reason: `${options.moderator} | ${options.reason}`,
					deleteMessageSeconds: options.deleteMessageSeconds
				})
				.catch(() => false);
			if (!banSuccess) return banResponse.ActionError;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'ban',
				user: options.user,
				guild: this,
				duration: 0,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PunishmentEntryError;

			if (!dmSuccessEvent) return banResponse.DmError;
			return banResponse.Success;
		})();
		return ret;
	}

	public override async customUnban(options: GuildCustomUnbanOptions): Promise<UnbanResponse> {
		// checks
		if (!this.members.me!.permissions.has(PermissionFlagsBits.BanMembers)) return unbanResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const user = await this.client.utils.resolveNonCachedUser(options.user);
		const moderator = this.client.users.resolve(options.moderator ?? this.client.user!);
		if (!user || !moderator) return unbanResponse.CannotResolveUser;

		const ret = await (async () => {
			const ban = await this.bans.fetch(user.id).catch(() => null);

			let notBanned = false;
			if (ban?.user?.id !== user.id) notBanned = true;

			const unbanSuccess = await this.bans
				.remove(user, `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch((e) => {
					if (e?.code === 'UNKNOWN_BAN') {
						notBanned = true;
						return true;
					} else return false;
				});

			if (notBanned) return unbanResponse.NotBanned;
			if (!unbanSuccess) return unbanResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.Unban,
				user: user.id,
				moderator: moderator.id,
				reason: options.reason,
				guild: this,
				evidence: options.evidence
			});
			if (!modlog) return unbanResponse.ModlogError;
			caseID = modlog.id;

			// remove punishment entry
			const removePunishmentEntrySuccess = await removePunishmentEntry({
				client: this.client,
				type: 'ban',
				user: user.id,
				guild: this
			});
			if (!removePunishmentEntrySuccess) return unbanResponse.PunishmentEntryError;

			if (!options.noDM) {
				// dm user
				dmSuccess = await punishDM({
					client: this.client,
					guild: this,
					user: user,
					punishment: Action.Unban,
					reason: options.reason ?? undefined,
					sendFooter: false
				});

				if (dmSuccess === false) return unbanResponse.DmError;
			}
			return unbanResponse.Success;
		})();
		if (!([unbanResponse.ActionError, unbanResponse.ModlogError, unbanResponse.PunishmentEntryError] as const).includes(ret))
			this.client.emit(
				TanzaniteEvent.Unban,
				user,
				moderator,
				this,
				options.reason ?? undefined,
				caseID!,
				dmSuccess,
				options.evidence
			);
		return ret;
	}

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
				if (!channel.permissionsFor(this.members.me!.id)?.has(PermissionFlagsBits.ManageChannels)) {
					errors.set(channel.id, new Error('client no permission'));
					success.set(channel.id, false);
					continue;
				} else if (!channel.permissionsFor(moderator)?.has(PermissionFlagsBits.ManageChannels)) {
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
								color: options.unlock ? colors.Green : colors.Red,
								timestamp: new Date().toISOString()
							}
						]
					});
				}
			}

			if (errors.size) return errors;
			else return `success: ${success.filter((c) => c === true).size}`;
		})();

		this.client.emit(
			options.unlock ? TanzaniteEvent.Unlockdown : TanzaniteEvent.Lockdown,
			moderator,
			options.reason,
			success,
			options.all
		);
		return ret;
	}

	public override async quote(rawQuote: APIMessage, channel: GuildTextBasedChannel): Promise<Message | null> {
		if (!channel.isTextBased() || channel.isDMBased() || channel.guildId !== this.id || !this.members.me) return null;
		if (!channel.permissionsFor(this.members.me).has('ManageWebhooks')) return null;

		const quote = new Message(this.client, rawQuote);

		const target = channel instanceof ThreadChannel ? channel.parent : channel;
		if (!target) return null;

		const webhooks: Collection<string, Webhook> = await target.fetchWebhooks().catch((e) => e);
		if (!(webhooks instanceof Collection)) return null;

		// find a webhook that we can use
		let webhook = webhooks.find((w) => !!w.token) ?? null;
		if (!webhook)
			webhook = await target
				.createWebhook({
					name: `${this.client.user!.username} Quotes #${target.name}`,
					avatar: this.client.user!.displayAvatarURL({ size: 2048 }),
					reason: 'Creating a webhook for quoting'
				})
				.catch(() => null);

		if (!webhook) return null;

		const sendOptions: Omit<WebhookMessageCreateOptions, 'flags'> = {};

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
				// @ts-expect-error: jank
				sendOptions.attachments = quote.attachments.size
					? [...quote.attachments.values()].map((a) => AttachmentBuilder.from(a as JSONEncodable<AttachmentPayload>))
					: undefined;

				if (quote.stickers.size && !(quote.content || quote.embeds.length || quote.attachments.size))
					sendOptions.content = '[[This message has a sticker but not content]]';

				break;
			case MessageType.RecipientAdd: {
				const recipient = rawQuote.mentions[0];
				if (!recipient) {
					sendOptions.content = `${emojis.error} Cannot resolve recipient.`;
					break;
				}

				if (quote.channel.isThread()) {
					const recipientDisplay = quote.guild?.members.cache.get(recipient.id)?.displayName ?? recipient.username;
					sendOptions.content = `${emojis.join} ${displayName} added ${recipientDisplay} to the thread.`;
				} else {
					// this should never happen
					sendOptions.content = `${emojis.join} ${displayName} added ${recipient.username} to the group.`;
				}

				break;
			}
			case MessageType.RecipientRemove: {
				const recipient = rawQuote.mentions[0];
				if (!recipient) {
					sendOptions.content = `${emojis.error} Cannot resolve recipient.`;
					break;
				}

				if (quote.channel.isThread()) {
					const recipientDisplay = quote.guild?.members.cache.get(recipient.id)?.displayName ?? recipient.username;
					sendOptions.content = `${emojis.leave} ${displayName} removed ${recipientDisplay} from the thread.`;
				} else {
					// this should never happen
					sendOptions.content = `${emojis.leave} ${displayName} removed ${recipient.username} from the group.`;
				}

				break;
			}

			case MessageType.ChannelNameChange:
				sendOptions.content = `<:pencil:957988608994861118> ${displayName} changed the channel name: **${quote.content}**`;

				break;

			case MessageType.ChannelPinnedMessage:
				throw new Error('Not implemented yet: MessageType.ChannelPinnedMessage case');
			case MessageType.UserJoin: {
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

				sendOptions.content = `${emojis.join} ${message}`;
				break;
			}
			case MessageType.GuildBoost:
				sendOptions.content = `<:NitroBoost:585558042309820447> ${displayName} just boosted the server${
					quote.content ? ` **${quote.content}** times` : ''
				}!`;

				break;
			case MessageType.GuildBoostTier1:
			case MessageType.GuildBoostTier2:
			case MessageType.GuildBoostTier3:
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
			// todo: use enum for this
			case 24 as MessageType: {
				const embed = quote.embeds[0];
				// eslint-disable-next-line deprecation/deprecation
				assert.equal(embed.data.type, 'auto_moderation_message');
				const ruleName = embed.fields!.find((f) => f.name === 'rule_name')!.value;
				const channelId = embed.fields!.find((f) => f.name === 'channel_id')!.value;
				const keyword = embed.fields!.find((f) => f.name === 'keyword')!.value;

				sendOptions.username = `AutoMod (${quote.member?.displayName ?? quote.author.username})`;
				sendOptions.content = `Automod has blocked a message in <#${channelId}>`;
				sendOptions.embeds = [
					{
						title: quote.member?.displayName ?? quote.author.username,
						description: embed.description ?? 'There is no content???',
						footer: {
							text: `Keyword: ${keyword} • Rule: ${ruleName}`
						},
						color: 0x36393f
					}
				];

				break;
			}
			case MessageType.ChannelIconChange:
			case MessageType.Call:
			default:
				sendOptions.content = `${emojis.error} I cannot quote messages of type **${
					MessageType[quote.type] || quote.type
				}** messages, please report this to my developers.`;

				break;
		}

		sendOptions.allowedMentions = AllowedMentions.none();
		sendOptions.username ??= (quote.member?.displayName ?? quote.author.username)
			.replaceAll(/discord/gi, '[REDACTED]')
			.replaceAll(/clyde/gi, '[REDACTED]');
		sendOptions.avatarURL = quote.member?.displayAvatarURL({ size: 2048 }) ?? quote.author.displayAvatarURL({ size: 2048 });

		return await webhook.send(sendOptions); /* .catch((e: any) => e); */
	}
}

/**
 * Options for unbanning a user
 */
export interface GuildCustomUnbanOptions {
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

	/**
	 * Don't send a dm to the user.
	 */
	noDM?: boolean;
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
	 * Number of seconds of messages to delete, must be between 0 and 604800 (7 days), inclusive
	 */
	deleteMessageSeconds?: number;
}

/**
 * Options for banning a user
 */
export interface GuildCustomBanOptions {
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
	 * Number of seconds of messages to delete, must be between 0 and 604800 (7 days), inclusive
	 */
	deleteMessageSeconds?: number;

	/**
	 * The evidence for the ban
	 */
	evidence?: string;

	/**
	 * Don't send a dm to the user.
	 */
	noDM?: boolean;
}

type ValueOf<T> = T[keyof T];

export const unbanResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...punishmentEntryError,
	NotBanned: 'user not banned'
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
