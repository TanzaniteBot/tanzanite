import type {
	BanResponse,
	CommandMessage,
	Guild as GuildDB,
	GuildSettings
} from '#lib';
import type { AkairoClientEvents } from 'discord-akairo';
import type {
	ButtonInteraction,
	Collection,
	Guild,
	GuildMember,
	GuildTextBasedChannel,
	Message,
	ModalSubmitInteraction,
	Role,
	SelectMenuInteraction,
	Snowflake,
	User
} from 'discord.js';

export interface BushClientEvents extends AkairoClientEvents {
	bushBan: [
		victim: GuildMember | User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess?: boolean,
		evidence?: string
	];
	bushBlock: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		channel: GuildTextBasedChannel,
		evidence?: string
	];
	bushKick: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushMute: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	bushPunishRole: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		role: Role,
		evidence?: string
	];
	bushPunishRoleRemove: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		role: Role,
		evidence?: string
	];
	bushPurge: [
		moderator: User,
		guild: Guild,
		channel: GuildTextBasedChannel,
		messages: Collection<Snowflake, Message>
	];
	bushRemoveTimeout: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushTimeout: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUnban: [
		victim: User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUnblock: [
		victim: GuildMember | User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		channel: GuildTextBasedChannel,
		evidence?: string
	];
	bushUnmute: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushUpdateModlog: [
		moderator: GuildMember,
		modlogID: string,
		key: 'evidence' | 'hidden',
		oldModlog: string | boolean,
		newModlog: string | boolean
	];
	bushUpdateSettings: [
		setting: Setting,
		guild: Guild,
		oldValue: GuildDB[Setting],
		newValue: GuildDB[Setting],
		moderator?: GuildMember
	];
	bushWarn: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	bushLevelUpdate: [
		member: GuildMember,
		oldLevel: number,
		newLevel: number,
		currentXp: number,
		message: CommandMessage
	];
	bushLockdown: [
		moderator: GuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
	bushUnlockdown: [
		moderator: GuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
	massBan: [
		moderator: GuildMember,
		guild: Guild,
		reason: string | undefined,
		results: Collection<Snowflake, BanResponse>
	];
	massEvidence: [
		moderator: GuildMember,
		guild: Guild,
		evidence: string,
		lines: string[]
	];
	/* components */
	button: [button: ButtonInteraction];
	selectMenu: [selectMenu: SelectMenuInteraction];
	modal: [modal: ModalSubmitInteraction];
}

type Setting =
	| GuildSettings
	| 'enabledFeatures'
	| 'blacklistedChannels'
	| 'blacklistedUsers'
	| 'disabledCommands';
