import type { BanResponse, CommandMessage, Guild as GuildDB, GuildSettings } from '#lib';
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

export enum TanzaniteEvent {
	Ban = 'customBan',
	Block = 'customBlock',
	Kick = 'customKick',
	Mute = 'customMute',
	PunishRoleAdd = 'punishRoleAdd',
	PunishRoleRemove = 'punishRoleRemove',
	Purge = 'customPurge',
	RemoveTimeout = 'customRemoveTimeout',
	Timeout = 'customTimeout',
	Unban = 'customUnban',
	Unblock = 'customUnblock',
	Unmute = 'customUnmute',
	UpdateModlog = 'updateModlog',
	UpdateSettings = 'updateSettings',
	Warn = 'customWarn',
	LevelUpdate = 'levelUpdate',
	Lockdown = 'lockdown',
	Unlockdown = 'unlockdown',
	MassBan = 'massBan',
	MassEvidence = 'massEvidence',
	Button = 'button',
	SelectMenu = 'selectMenu',
	ModalSubmit = 'modal'
}

export interface BotClientEvents extends AkairoClientEvents {
	[TanzaniteEvent.Ban]: [
		victim: GuildMember | User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess?: boolean,
		evidence?: string
	];
	[TanzaniteEvent.Block]: [
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
	[TanzaniteEvent.Kick]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.Mute]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.PunishRoleAdd]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		role: Role,
		evidence?: string
	];
	[TanzaniteEvent.PunishRoleRemove]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		role: Role,
		evidence?: string
	];
	[TanzaniteEvent.Purge]: [
		moderator: User,
		guild: Guild,
		channel: GuildTextBasedChannel,
		messages: Collection<Snowflake, Message>
	];
	[TanzaniteEvent.RemoveTimeout]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.Timeout]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		duration: number,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.Unban]: [
		victim: User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.Unblock]: [
		victim: GuildMember | User,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		channel: GuildTextBasedChannel,
		evidence?: string
	];
	[TanzaniteEvent.Unmute]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.UpdateModlog]: [
		moderator: GuildMember,
		modlogID: string,
		key: 'evidence' | 'hidden',
		oldModlog: string | boolean,
		newModlog: string | boolean
	];
	[TanzaniteEvent.UpdateSettings]: [
		setting: Setting,
		guild: Guild,
		oldValue: GuildDB[Setting],
		newValue: GuildDB[Setting],
		moderator?: GuildMember
	];
	[TanzaniteEvent.Warn]: [
		victim: GuildMember,
		moderator: User,
		guild: Guild,
		reason: string | undefined,
		caseID: string,
		dmSuccess: boolean,
		evidence?: string
	];
	[TanzaniteEvent.LevelUpdate]: [
		member: GuildMember,
		oldLevel: number,
		newLevel: number,
		currentXp: number,
		message: CommandMessage
	];
	[TanzaniteEvent.Lockdown]: [
		moderator: GuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
	[TanzaniteEvent.Unlockdown]: [
		moderator: GuildMember,
		reason: string | undefined,
		channelsSuccessMap: Collection<Snowflake, boolean>,
		all?: boolean
	];
	[TanzaniteEvent.MassBan]: [
		moderator: GuildMember,
		guild: Guild,
		reason: string | undefined,
		results: Collection<Snowflake, BanResponse>
	];
	[TanzaniteEvent.MassEvidence]: [moderator: GuildMember, guild: Guild, evidence: string, lines: string[]];
	/* components */
	[TanzaniteEvent.Button]: [button: ButtonInteraction];
	[TanzaniteEvent.SelectMenu]: [selectMenu: SelectMenuInteraction];
	[TanzaniteEvent.ModalSubmit]: [modal: ModalSubmitInteraction];
}

type Setting = GuildSettings | 'enabledFeatures' | 'blacklistedChannels' | 'blacklistedUsers' | 'disabledCommands';
