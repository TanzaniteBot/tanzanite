import { baseMuteResponse, permissionsResponse } from '#lib/extensions/discord.js/ExtendedGuildMember.js';
import { colors, emojis } from '#lib/utils/Constants.js';
import { format, humanizeDuration, type ValueOf } from '#lib/utils/Utils.js';
import { ActivePunishment, ActivePunishmentType, Guild as GuildDB, ModLog, type ModLogType } from '#models';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	PermissionFlagsBits,
	type Client,
	type Guild,
	type GuildMember,
	type GuildMemberResolvable,
	type GuildResolvable,
	type Snowflake,
	type UserResolvable
} from 'discord.js';
import assert from 'node:assert/strict';

export enum Action {
	Warn,
	Mute,
	Unmute,
	Kick,
	Ban,
	Unban,
	Timeout,
	Untimeout,
	Block,
	Unblock,
	AddPunishRole,
	RemovePunishRole
}

interface ActionInfo {
	/**
	 * The base verb of the action
	 */
	base: string;

	/**
	 * The past tense form of the action
	 */
	past: string;

	/**
	 * Whether or not a user can appeal this action
	 */
	appealable: boolean;

	/**
	 * Whether a moderator can perform this action on themself.
	 */
	selfInflictable: boolean;

	/**
	 * Whether the action requires the target to be in the guild.
	 */
	membershipRequired: boolean;

	/**
	 * Custom appeal title, otherwise {@link ActionInfo.base} is used.
	 */
	appealCustom?: string;
}

export const punishments: Record<Action, ActionInfo> = {
	[Action.Warn]: {
		base: 'warn',
		past: 'warned',
		appealable: false,
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.Mute]: {
		base: 'mute',
		past: 'muted',
		appealable: true,
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.Unmute]: {
		base: 'unmute',
		past: 'unmuted',
		appealable: false,
		selfInflictable: true,
		membershipRequired: true
	},
	[Action.Kick]: {
		base: 'kick',
		past: 'kicked',
		appealable: false,
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.Ban]: {
		base: 'ban',
		past: 'banned',
		appealable: true,
		selfInflictable: false,
		membershipRequired: false
	},
	[Action.Unban]: {
		base: 'unban',
		past: 'unbanned',
		appealable: false,
		selfInflictable: true,
		membershipRequired: false
	},
	[Action.Timeout]: {
		base: 'timeout',
		past: 'timed out',
		appealable: true,
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.Untimeout]: {
		base: 'untimeout',
		past: 'untimed out',
		appealable: false,
		selfInflictable: true,
		membershipRequired: true
	},
	[Action.Block]: {
		base: 'block',
		past: 'blocked',
		appealable: true,
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.Unblock]: {
		base: 'unblock',
		past: 'unblocked',
		appealable: false,
		selfInflictable: true,
		membershipRequired: true
	},
	[Action.AddPunishRole]: {
		base: 'add a punishment role to',
		past: 'added punishment role',
		appealable: true,
		appealCustom: 'Punishment Role',
		selfInflictable: false,
		membershipRequired: true
	},
	[Action.RemovePunishRole]: {
		base: 'remove a punishment role from',
		past: 'removed punishment role',
		appealable: false,
		selfInflictable: true,
		membershipRequired: true
	}
};

interface BaseOptions {
	/**
	 * The client.
	 */
	client: Client;
}

interface BaseCreateModLogEntryOptions extends BaseOptions {
	/**
	 * The type of modlog entry.
	 */
	type: ModLogType;

	/**
	 * The reason for the punishment.
	 */
	reason: string | undefined | null;

	/**
	 * The duration of the punishment.
	 */
	duration?: number;

	/**
	 * Whether the punishment is a pseudo punishment.
	 */
	pseudo?: boolean;

	/**
	 * The evidence for the punishment.
	 */
	evidence?: string;

	/**
	 * Makes the modlog entry hidden.
	 */
	hidden?: boolean;
}

/**
 * Checks if a moderator can perform a moderation action on another user.
 * @param moderator The person trying to perform the action.
 * @param victim The person getting punished.
 * @param type The type of punishment - used to format the response.
 * @param checkModerator Whether or not to check if the victim is a moderator.
 * @param force Override permissions checks.
 * @returns `true` if the moderator can perform the action otherwise a reason why they can't.
 */
export async function permissionCheck(
	moderator: GuildMember,
	victim: GuildMember,
	type: Action,
	checkModerator = true,
	force = false
): Promise<true | string> {
	if (force) return true;

	const action = punishments[type];

	// If the victim is not in the guild anymore it will be undefined
	if (!victim?.guild && action.membershipRequired) return true;

	assert(moderator.guild.id === victim.guild.id, 'moderator and victim should be from the same guild');

	const isOwner = moderator.guild.ownerId === moderator.id;

	const selfInflicted = moderator.id === victim.id;

	if (selfInflicted && !action.selfInflictable) {
		return `${emojis.error} You cannot ${action.base} yourself.`;
	}
	if (
		moderator.roles.highest.position <= victim.roles.highest.position &&
		!isOwner &&
		!(action.selfInflictable && selfInflicted)
	) {
		return `${emojis.error} You cannot ${action.base} ${format.input(
			victim.user.tag
		)} because they have higher or equal role hierarchy as you do.`;
	}
	if (
		victim.roles.highest.position >= victim.guild.members.me!.roles.highest.position &&
		!(action.selfInflictable && selfInflicted)
	) {
		return `${emojis.error} You cannot ${action.base} ${format.input(
			victim.user.tag
		)} because they have higher or equal role hierarchy as I do.`;
	}
	if (
		checkModerator &&
		victim.permissions.has(PermissionFlagsBits.ManageMessages) &&
		!(action.selfInflictable && selfInflicted)
	) {
		if (await moderator.guild.hasFeature('modsCanPunishMods')) {
			return true;
		} else {
			return `${emojis.error} You cannot ${action.base} ${format.input(victim.user.tag)} because they are a moderator.`;
		}
	}
	return true;
}

/**
 * Performs permission checks that are required in order to (un)mute a member.
 * @param guild The guild to check the mute permissions in.
 * @returns A {@link MuteResponse} or true if nothing failed.
 */
export async function checkMutePermissions(
	guild: Guild
): Promise<ValueOf<typeof baseMuteResponse> | ValueOf<typeof permissionsResponse> | true> {
	if (!guild.members.me!.permissions.has('ManageRoles')) {
		return permissionsResponse.MissingPermissions;
	}

	const muteRoleID = await guild.getSetting('muteRole');
	if (!muteRoleID) return baseMuteResponse.NoMuteRole;

	const muteRole = guild.roles.cache.get(muteRoleID);
	if (!muteRole) return baseMuteResponse.MuteRoleInvalid;

	if (muteRole.position >= guild.members.me!.roles.highest.position || muteRole.managed) {
		return baseMuteResponse.MuteRoleNotManageable;
	}

	return true;
}

/**
 * Options for creating a modlog entry.
 */
export interface CreateModLogEntryOptions extends BaseCreateModLogEntryOptions {
	/**
	 * The client.
	 */
	client: Client;

	/**
	 * The user that a modlog entry is created for.
	 */
	user: GuildMemberResolvable;

	/**
	 * The moderator that created the modlog entry.
	 */
	moderator: GuildMemberResolvable;

	/**
	 * The guild that the punishment is created for.
	 */
	guild: GuildResolvable;
}

/**
 * Creates a modlog entry for a punishment.
 * @param options Options for creating a modlog entry.
 * @param getCaseNumber Whether or not to get the case number of the entry.
 * @returns An object with the modlog and the case number.
 */
export async function createModLogEntry(
	options: CreateModLogEntryOptions,
	getCaseNumber = false
): Promise<{ log: ModLog | null; caseNum: number | null }> {
	const user = (await options.client.utils.resolveNonCachedUser(options.user))!.id;
	const moderator = (await options.client.utils.resolveNonCachedUser(options.moderator))!.id;
	const guild = options.client.guilds.resolveId(options.guild)!;

	return createModLogEntrySimple(
		{
			...options,
			user: user,
			moderator: moderator,
			guild: guild
		},
		getCaseNumber
	);
}

/**
 * Simple options for creating a modlog entry.
 */
export interface SimpleCreateModLogEntryOptions extends BaseCreateModLogEntryOptions {
	/**
	 * The user that a modlog entry is created for.
	 */
	user: Snowflake;

	/**
	 * The moderator that created the modlog entry.
	 */
	moderator: Snowflake;

	/**
	 * The guild that the punishment is created for.
	 */
	guild: Snowflake;
}

/**
 * Creates a modlog entry with already resolved ids.
 * @param options Options for creating a modlog entry.
 * @param getCaseNumber Whether or not to get the case number of the entry.
 * @returns An object with the modlog and the case number.
 */
export async function createModLogEntrySimple(
	options: SimpleCreateModLogEntryOptions,
	getCaseNumber = false
): Promise<{ log: ModLog | null; caseNum: number | null }> {
	// If guild does not exist create it so the modlog can reference a guild.
	await GuildDB.findOrCreate({
		where: { id: options.guild },
		defaults: { id: options.guild }
	});

	const modLogEntry = ModLog.build({
		type: options.type,
		user: options.user,
		moderator: options.moderator,
		reason: options.reason,
		duration: options.duration ? options.duration : undefined,
		guild: options.guild,
		pseudo: options.pseudo ?? false,
		evidence: options.evidence,
		hidden: options.hidden ?? false
	});

	const saveResult: ModLog | null = await modLogEntry.save().catch(async (e) => {
		await options.client.utils.handleError('createModLogEntry', e);
		return null;
	});

	if (!getCaseNumber) return { log: saveResult, caseNum: null };

	const caseNum = (
		await ModLog.findAll({ where: { type: options.type, user: options.user, guild: options.guild, hidden: false } })
	)?.length;
	return { log: saveResult, caseNum };
}

/**
 * Options for creating a punishment entry.
 */
export interface CreatePunishmentEntryOptions extends BaseOptions {
	/**
	 * The type of punishment.
	 */
	type: 'mute' | 'ban' | 'role' | 'block';

	/**
	 * The user that the punishment is created for.
	 */
	user: GuildMemberResolvable;

	/**
	 * The length of time the punishment lasts for.
	 */
	duration: number | undefined;

	/**
	 * The guild that the punishment is created for.
	 */
	guild: GuildResolvable;

	/**
	 * The id of the modlog that is linked to the punishment entry.
	 */
	modlog: string;

	/**
	 * Extra information for the punishment. The role for role punishments and the channel for blocks.
	 */
	extraInfo?: Snowflake;
}

/**
 * Creates a punishment entry.
 * @param options Options for creating the punishment entry.
 * @returns The database entry, or null if no entry is created.
 */
export async function createPunishmentEntry(options: CreatePunishmentEntryOptions): Promise<ActivePunishment | null> {
	const expires = options.duration ? new Date(+new Date() + (options.duration ?? 0)) : undefined;
	const user = (await options.client.utils.resolveNonCachedUser(options.user))!.id;
	const guild = options.client.guilds.resolveId(options.guild)!;
	const type = findTypeEnum(options.type)!;

	const entry = ActivePunishment.build(
		options.extraInfo
			? { user, type, guild, expires, modlog: options.modlog, extraInfo: options.extraInfo }
			: { user, type, guild, expires, modlog: options.modlog }
	);

	return await entry.save().catch(async (e) => {
		await options.client.utils.handleError('createPunishmentEntry', e);
		return null;
	});
}

/**
 * Options for removing a punishment entry.
 */
export interface RemovePunishmentEntryOptions extends BaseOptions {
	/**
	 * The type of punishment.
	 */
	type: 'mute' | 'ban' | 'role' | 'block';

	/**
	 * The user that the punishment is destroyed for.
	 */
	user: GuildMemberResolvable;

	/**
	 * The guild that the punishment was in.
	 */
	guild: GuildResolvable;

	/**
	 * Extra information for the punishment. The role for role punishments and the channel for blocks.
	 */
	extraInfo?: Snowflake;
}

/**
 * Destroys a punishment entry.
 * @param options Options for destroying the punishment entry.
 * @returns Whether or not the entry was destroyed.
 */
export async function removePunishmentEntry(options: RemovePunishmentEntryOptions): Promise<boolean> {
	const user = await options.client.utils.resolveNonCachedUser(options.user);
	const guild = options.client.guilds.resolveId(options.guild);
	const type = findTypeEnum(options.type);

	if (!user || !guild) return false;

	let success = true;

	const entries = await ActivePunishment.findAll({
		// finding all cases of a certain type incase there were duplicates or something
		where: options.extraInfo
			? { user: user.id, guild: guild, type, extraInfo: options.extraInfo }
			: { user: user.id, guild: guild, type }
	}).catch(async (e) => {
		await options.client.utils.handleError('removePunishmentEntry', e);
		success = false;
	});

	if (entries) {
		const promises = entries.map(async (entry) =>
			entry.destroy().catch(async (e) => {
				await options.client.utils.handleError('removePunishmentEntry', e);
				success = false;
			})
		);

		await Promise.all(promises);
	}
	return success;
}

/**
 * Returns the punishment type enum for the given type.
 * @param type The type of the punishment.
 * @returns The punishment type enum.
 */
function findTypeEnum(type: 'mute' | 'ban' | 'role' | 'block') {
	const typeMap = {
		mute: ActivePunishmentType.Mute,
		ban: ActivePunishmentType.Ban,
		role: ActivePunishmentType.Role,
		block: ActivePunishmentType.Block
	};
	return typeMap[type];
}

/**
 * Options for sending a user a punishment dm.
 */
export interface PunishDMOptions extends BaseOptions {
	/**
	 * The modlog case id so the user can make an appeal.
	 */
	modlog?: string;

	/**
	 * The guild that the punishment is taking place in.
	 */
	guild: Guild;

	/**
	 * The user that is being punished.
	 */
	user: UserResolvable;

	/**
	 * The punishment that the user has received.
	 */
	punishment: Action;

	/**
	 * The reason the user's punishment.
	 */
	reason?: string;

	/**
	 * The duration of the punishment.
	 */
	duration?: number;

	/**
	 * Whether or not to send the guild's punishment footer with the dm.
	 * @default true
	 */
	sendFooter: boolean;

	/**
	 * The channel that the user was (un)blocked from.
	 */
	channel?: Snowflake;

	/**
	 * The role that the user was given/removed.
	 */
	role?: {
		id: Snowflake;
		name: string;
	};
}

/**
 * Notifies the specified user of their punishment.
 * @param options Options for notifying the user.
 * @returns Whether or not the dm was successfully sent.
 */
export async function punishDM(options: PunishDMOptions): Promise<boolean> {
	const ending = await options.guild.getSetting('punishmentEnding');
	const dmEmbed =
		ending && ending.length && options.sendFooter
			? new EmbedBuilder().setDescription(ending).setColor(colors.newBlurple)
			: undefined;

	const appealsEnabled =
		(await options.guild.hasFeature('punishmentAppeals')) && Boolean(await options.guild.getLogChannel('appeals'));

	let content = '';

	switch (options.punishment) {
		case Action.AddPunishRole:
			assert(options.role, 'Role is required for adding a punishment role.');
			content += `You have received the "${options.role.name}" punishment role`;
			break;
		case Action.RemovePunishRole:
			assert(options.role, 'Role is required for removing a punishment role.');
			content += `The "${options.role.name}" punishment role has been removed from you`;
			break;
		default:
			content += `You have been ${punishments[options.punishment].past}`;
			break;
	}

	if ([Action.Block, Action.Unblock].includes(options.punishment)) {
		assert(options.channel);
		content += ` from <#${options.channel}>`;
	}

	content += ` in ${format.input(options.guild.name)}`;
	if (options.duration !== null && options.duration !== undefined) {
		content += options.duration ? ` for ${humanizeDuration(options.duration)}` : ' permanently';
	}

	if (![Action.AddPunishRole, Action.RemovePunishRole].includes(options.punishment)) {
		const reason = options.reason?.trim() ? options.reason?.trim() : 'No reason provided';
		content += ` for ${format.input(reason)}.`;
	} else {
		content += '.';
	}

	let components;
	if (appealsEnabled && options.modlog) {
		const punishment = options.punishment;
		const guildId = options.guild.id;
		const userId = options.client.users.resolveId(options.user);
		const modlogCase = options.modlog;

		const extraId = options.channel ?? options.role?.id;

		components = [
			new ActionRowBuilder<ButtonBuilder>({
				components: [
					new ButtonBuilder({
						customId: `appeal_attempt;${Action[punishment]};${guildId};${userId};${modlogCase}${extraId ? `;${extraId}` : ''}`,
						style: ButtonStyle.Primary,
						label: 'Appeal Punishment'
					})
				]
			})
		];
	}

	const dmSuccess = await options.client.users
		.send(options.user, {
			content,
			embeds: dmEmbed ? [dmEmbed] : undefined,
			components
		})
		.catch(() => false);
	return !!dmSuccess;
}
