import {
	ClientEvents,
	Collection,
	Interaction,
	InvalidRequestWarningData,
	Invite,
	RateLimitData,
	Snowflake,
	Sticker,
	Typing
} from 'discord.js';
import {
	BushClient,
	BushTextBasedChannels
} from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushDMChannel } from './BushDMChannel';
import { BushGuild } from './BushGuild';
import { BushGuildBan } from './BushGuildBan';
import { BushGuildChannel } from './BushGuildChannel';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushGuildMember, PartialBushGuildMember } from './BushGuildMember';
import { BushMessage, PartialBushMessage } from './BushMessage';
import {
	BushMessageReaction,
	PartialBushMessageReaction
} from './BushMessageReaction';
import { BushNewsChannel } from './BushNewsChannel';
import { BushPresence } from './BushPresence';
import { BushRole } from './BushRole';
import { BushStageInstance } from './BushStageInstance';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';
import { BushThreadMember } from './BushThreadMember';
import { BushUser, PartialBushUser } from './BushUser';
import { BushVoiceState } from './BushVoiceState';

export interface BushClientEvents extends ClientEvents {
	applicationCommandCreate: [command: BushApplicationCommand];
	applicationCommandDelete: [command: BushApplicationCommand];
	applicationCommandUpdate: [
		oldCommand: BushApplicationCommand | null,
		newCommand: BushApplicationCommand
	];
	channelCreate: [channel: BushGuildChannel];
	channelDelete: [channel: BushDMChannel | BushGuildChannel];
	channelPinsUpdate: [channel: BushTextBasedChannels, date: Date];
	channelUpdate: [
		oldChannel: BushDMChannel | BushGuildChannel,
		newChannel: BushDMChannel | BushGuildChannel
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
	guildMemberUpdate: [
		oldMember: BushGuildMember | PartialBushGuildMember,
		newMember: BushGuildMember
	];
	guildUpdate: [oldGuild: BushGuild, newGuild: BushGuild];
	inviteCreate: [invite: Invite];
	inviteDelete: [invite: Invite];
	messageCreate: [message: BushMessage];
	messageDelete: [message: BushMessage | PartialBushMessage];
	messageReactionRemoveAll: [message: BushMessage | PartialBushMessage];
	messageReactionRemoveEmoji: [
		reaction: BushMessageReaction | PartialBushMessageReaction
	];
	messageDeleteBulk: [
		messages: Collection<Snowflake, BushMessage | PartialBushMessage>
	];
	messageReactionAdd: [
		reaction: BushMessageReaction | PartialBushMessageReaction,
		user: BushUser | PartialBushUser
	];
	messageReactionRemove: [
		reaction: BushMessageReaction | PartialBushMessageReaction,
		user: BushUser | PartialBushUser
	];
	messageUpdate: [
		oldMessage: BushMessage | PartialBushMessage,
		newMessage: BushMessage | PartialBushMessage
	];
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
	threadMemberUpdate: [
		oldMember: BushThreadMember,
		newMember: BushThreadMember
	];
	threadMembersUpdate: [
		oldMembers: Collection<Snowflake, BushThreadMember>,
		newMembers: Collection<Snowflake, BushThreadMember>
	];
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
	stageInstanceUpdate: [
		oldStageInstance: BushStageInstance | null,
		newStageInstance: BushStageInstance
	];
	stageInstanceDelete: [stageInstance: BushStageInstance];
	stickerCreate: [sticker: Sticker];
	stickerDelete: [sticker: Sticker];
	stickerUpdate: [oldSticker: Sticker, newSticker: Sticker];
	/* Custom */
	bushBan: [
		victim: BushGuildMember | BushUser,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess?: boolean
	];
	bushKick: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean
	];
	bushMute: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean
	];
	bushPunishRole: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		role: BushRole
	];
	bushPunishRoleRemove: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		caseID: string,
		reason: string | undefined,
		role: BushRole
	];
	bushPurge: [
		moderator: BushUser,
		guild: BushGuild,
		channel: BushTextChannel | BushNewsChannel | BushThreadChannel,
		messages: Collection<Snowflake, BushMessage>
	];
	bushUnban: [
		victim: BushUser,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean
	];
	bushUnmute: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean
	];
	bushWarn: [
		victim: BushGuildMember,
		moderator: BushUser,
		guild: BushGuild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean
	];
}
