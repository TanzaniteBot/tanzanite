import type {
	BushApplicationCommand,
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildBan,
	BushGuildEmoji,
	BushGuildMember,
	BushGuildTextBasedChannel,
	BushMessage,
	BushMessageReaction,
	BushNewsChannel,
	BushNonThreadGuildBasedChannel,
	BushPresence,
	BushRole,
	BushStageInstance,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushThreadMember,
	BushUser,
	BushVoiceState,
	Guild,
	GuildSettings,
	PartialBushGuildMember,
	PartialBushMessage,
	PartialBushMessageReaction,
	PartialBushUser
} from '#lib';
import type { AkairoClientEvents } from 'discord-akairo';
import type {
	Collection,
	GuildScheduledEvent,
	Interaction,
	InvalidRequestWarningData,
	Invite,
	RateLimitData,
	Snowflake,
	Sticker,
	Typing
} from 'discord.js';

export interface BushClientEvents extends AkairoClientEvents {
	applicationCommandCreate: [command: BushApplicationCommand];
	applicationCommandDelete: [command: BushApplicationCommand];
	applicationCommandUpdate: [oldCommand: BushApplicationCommand | null, newCommand: BushApplicationCommand];
	channelCreate: [channel: BushNonThreadGuildBasedChannel];
	channelDelete: [channel: BushDMChannel | BushNonThreadGuildBasedChannel];
	channelPinsUpdate: [channel: BushTextBasedChannel, date: Date];
	channelUpdate: [
		oldChannel: BushDMChannel | BushNonThreadGuildBasedChannel,
		newChannel: BushDMChannel | BushNonThreadGuildBasedChannel
	];
	debug: [message: string];
	warn: [message: string];
	emojiCreate: [emoji: BushGuildEmoji];
	emojiDelete: [emoji: BushGuildEmoji];
	emojiUpdate: [oldEmoji: BushGuildEmoji, newEmoji: BushGuildEmoji];
	error: [error: Error];
	guildBanAdd: [ban: BushGuildBan];
	guildBanRemove: [ban: BushGuildBan];
	guildCreate: [guild: BushGuild];
	guildDelete: [guild: BushGuild];
	guildUnavailable: [guild: BushGuild];
	guildIntegrationsUpdate: [guild: BushGuild];
	guildMemberAdd: [member: BushGuildMember];
	guildMemberAvailable: [member: BushGuildMember | PartialBushGuildMember];
	guildMemberRemove: [member: BushGuildMember | PartialBushGuildMember];
	guildMembersChunk: [
		members: Collection<Snowflake, BushGuildMember>,
		guild: BushGuild,
		data: {
			count: number;
			index: number;
			nonce: string | undefined;
		}
	];
	guildMemberUpdate: [oldMember: BushGuildMember | PartialBushGuildMember, newMember: BushGuildMember];
	guildUpdate: [oldGuild: BushGuild, newGuild: BushGuild];
	inviteCreate: [invite: Invite];
	inviteDelete: [invite: Invite];
	messageCreate: [message: BushMessage];
	messageDelete: [message: BushMessage | PartialBushMessage];
	messageReactionRemoveAll: [message: BushMessage | PartialBushMessage, reactions: Collection<string, BushMessageReaction>];
	messageReactionRemoveEmoji: [reaction: BushMessageReaction | PartialBushMessageReaction];
	messageDeleteBulk: [messages: Collection<Snowflake, BushMessage | PartialBushMessage>];
	messageReactionAdd: [reaction: BushMessageReaction | PartialBushMessageReaction, user: BushUser | PartialBushUser];
	messageReactionRemove: [reaction: BushMessageReaction | PartialBushMessageReaction, user: BushUser | PartialBushUser];
	messageUpdate: [oldMessage: BushMessage | PartialBushMessage, newMessage: BushMessage | PartialBushMessage];
	presenceUpdate: [oldPresence: BushPresence | null, newPresence: BushPresence];
	rateLimit: [rateLimitData: RateLimitData];
	invalidRequestWarning: [invalidRequestWarningData: InvalidRequestWarningData];
	ready: [client: BushClient<true>];
	invalidated: [];
	roleCreate: [role: BushRole];
	roleDelete: [role: BushRole];
	roleUpdate: [oldRole: BushRole, newRole: BushRole];
	threadCreate: [thread: BushThreadChannel];
	threadDelete: [thread: BushThreadChannel];
	threadListSync: [threads: Collection<Snowflake, BushThreadChannel>];
	threadMemberUpdate: [oldMember: BushThreadMember, newMember: BushThreadMember];
	threadMembersUpdate: [oldMembers: Collection<Snowflake, BushThreadMember>, newMembers: Collection<Snowflake, BushThreadMember>];
	threadUpdate: [oldThread: BushThreadChannel, newThread: BushThreadChannel];
	typingStart: [typing: Typing];
	userUpdate: [oldUser: BushUser | PartialBushUser, newUser: BushUser];
	voiceStateUpdate: [oldState: BushVoiceState, newState: BushVoiceState];
	webhookUpdate: [channel: BushTextChannel];
	interactionCreate: [interaction: Interaction];
	shardError: [error: Error, shardId: number];
	shardReady: [shardId: number, unavailableGuilds: Set<Snowflake> | undefined];
	shardReconnecting: [shardId: number];
	shardResume: [shardId: number, replayedEvents: number];
	stageInstanceCreate: [stageInstance: BushStageInstance];
	stageInstanceUpdate: [oldStageInstance: BushStageInstance | null, newStageInstance: BushStageInstance];
	stageInstanceDelete: [stageInstance: BushStageInstance];
	stickerCreate: [sticker: Sticker];
	stickerDelete: [sticker: Sticker];
	stickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
	guildScheduledEventCreate: [guildScheduledEvent: GuildScheduledEvent];
	guildScheduledEventUpdate: [oldGuildScheduledEvent: GuildScheduledEvent, newGuildScheduledEvent: GuildScheduledEvent];
	guildScheduledEventDelete: [guildScheduledEvent: GuildScheduledEvent];
	guildScheduledEventUserAdd: [guildScheduledEvent: GuildScheduledEvent, user: BushUser];
	guildScheduledEventUserRemove: [guildScheduledEvent: GuildScheduledEvent, user: BushUser];
	/* Custom */
	bushBan: [
		victim: BushGuildMember | BushUser,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess?: boolean,
		evidence?: string
	];
	bushBlock: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		channel: BushGuildTextBasedChannel,
		evidence?: string
	];
	bushKick: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushMute: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	bushPunishRole: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		role: BushRole,
		evidence?: string
	];
	bushPunishRoleRemove: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		role: BushRole,
		evidence?: string
	];
	bushPurge: [
		moderator: BushUser,
		guild: BushGuild,
		channel: BushTextChannel | BushNewsChannel | BushThreadChannel,
		messages: Collection<Snowflake, BushMessage>
	];
	bushRemoveTimeout: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushTimeout: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUnban: [
		victim: BushUser,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUnblock: [
		victim: BushGuildMember | BushUser,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		channel: BushGuildTextBasedChannel,
		evidence?: string
	];
	bushUnmute: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUpdateModlog: [
		moderator: BushGuildMember,
		modlogID: string,
		key: 'evidence' | 'hidden',
		oldModlog: string | boolean,
		newModlog: string | boolean
	];
	bushUpdateSettings: [
		setting: Setting,
		guild: BushGuild,
		oldValue: Guild[Setting],
		newValue: Guild[Setting],
		moderator?: BushGuildMember
	];
	bushWarn: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushLevelUpdate: [
		member: BushGuildMember,
		oldLevel: number,
		newLevel: number,
		currentXp: number,
		message: BushMessage & { guild: BushGuild }
	];
	bushLockdown: [
		moderator: BushGuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
	bushUnlockdown: [
		moderator: BushGuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
}

type Setting = GuildSettings | 'enabledFeatures' | 'blacklistedChannels' | 'blacklistedUsers' | 'disabledCommands';
