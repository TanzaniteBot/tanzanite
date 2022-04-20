import {
	ActivePunishment,
	ActivePunishmentType,
	Guild,
	ModLog,
	type BushGuild,
	type BushGuildMember,
	type BushGuildMemberResolvable,
	type BushGuildResolvable,
	type BushUserResolvable,
	type ModLogType
} from '#lib';
import assert from 'assert';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, type Snowflake } from 'discord.js';

enum punishMap {
	'warned' = 'warn',
	'muted' = 'mute',
	'unmuted' = 'unmute',
	'kicked' = 'kick',
	'banned' = 'ban',
	'unbanned' = 'unban',
	'timedout' = 'timeout',
	'untimedout' = 'untimeout',
	'blocked' = 'block',
	'unblocked' = 'unblock'
}
enum reversedPunishMap {
	'warn' = 'warned',
	'mute' = 'muted',
	'unmute' = 'unmuted',
	'kick' = 'kicked',
	'ban' = 'banned',
	'unban' = 'unbanned',
	'timeout' = 'timedout',
	'untimeout' = 'untimedout',
	'block' = 'blocked',
	'unblock' = 'unblocked'
}

/**
 * A utility class with moderation-related methods.
 */
export class Moderation {
	/**
	 * Checks if a moderator can perform a moderation action on another user.
	 * @param moderator The person trying to perform the action.
	 * @param victim The person getting punished.
	 * @param type The type of punishment - used to format the response.
	 * @param checkModerator Whether or not to check if the victim is a moderator.
	 * @param force Override permissions checks.
	 * @returns `true` if the moderator can perform the action otherwise a reason why they can't.
	 */
	public static async permissionCheck(
		moderator: BushGuildMember,
		victim: BushGuildMember,
		type:
			| 'mute'
			| 'unmute'
			| 'warn'
			| 'kick'
			| 'ban'
			| 'unban'
			| 'add a punishment role to'
			| 'remove a punishment role from'
			| 'block'
			| 'unblock'
			| 'timeout'
			| 'untimeout',
		checkModerator = true,
		force = false
	): Promise<true | string> {
		if (force) return true;

		// If the victim is not in the guild anymore it will be undefined
		if ((!victim || !victim.guild) && !['ban', 'unban'].includes(type)) return true;

		if (moderator.guild.id !== victim.guild.id) {
			throw new Error('moderator and victim not in same guild');
		}

		const isOwner = moderator.guild.ownerId === moderator.id;
		if (moderator.id === victim.id && !type.startsWith('un')) {
			return `${util.emojis.error} You cannot ${type} yourself.`;
		}
		if (
			moderator.roles.highest.position <= victim.roles.highest.position &&
			!isOwner &&
			!(type.startsWith('un') && moderator.id === victim.id)
		) {
			return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they have higher or equal role hierarchy as you do.`;
		}
		if (
			victim.roles.highest.position >= victim.guild.me!.roles.highest.position &&
			!(type.startsWith('un') && moderator.id === victim.id)
		) {
			return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they have higher or equal role hierarchy as I do.`;
		}
		if (
			checkModerator &&
			victim.permissions.has(PermissionFlagsBits.ManageMessages) &&
			!(type.startsWith('un') && moderator.id === victim.id)
		) {
			if (await moderator.guild.hasFeature('modsCanPunishMods')) {
				return true;
			} else {
				return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they are a moderator.`;
			}
		}
		return true;
	}

	/**
	 * Creates a modlog entry for a punishment.
	 * @param options Options for creating a modlog entry.
	 * @param getCaseNumber Whether or not to get the case number of the entry.
	 * @returns An object with the modlog and the case number.
	 */
	public static async createModLogEntry(
		options: CreateModLogEntryOptions,
		getCaseNumber = false
	): Promise<{ log: ModLog | null; caseNum: number | null }> {
		const user = (await util.resolveNonCachedUser(options.user))!.id;
		const moderator = (await util.resolveNonCachedUser(options.moderator))!.id;
		const guild = client.guilds.resolveId(options.guild)!;

		return this.createModLogEntrySimple(
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
	 * Creates a modlog entry with already resolved ids.
	 * @param options Options for creating a modlog entry.
	 * @param getCaseNumber Whether or not to get the case number of the entry.
	 * @returns An object with the modlog and the case number.
	 */
	public static async createModLogEntrySimple(
		options: SimpleCreateModLogEntryOptions,
		getCaseNumber = false
	): Promise<{ log: ModLog | null; caseNum: number | null }> {
		// If guild does not exist create it so the modlog can reference a guild.
		await Guild.findOrCreate({
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
			await util.handleError('createModLogEntry', e);
			return null;
		});

		if (!getCaseNumber) return { log: saveResult, caseNum: null };

		const caseNum = (
			await ModLog.findAll({ where: { type: options.type, user: options.user, guild: options.guild, hidden: false } })
		)?.length;
		return { log: saveResult, caseNum };
	}

	/**
	 * Creates a punishment entry.
	 * @param options Options for creating the punishment entry.
	 * @returns The database entry, or null if no entry is created.
	 */
	public static async createPunishmentEntry(options: CreatePunishmentEntryOptions): Promise<ActivePunishment | null> {
		const expires = options.duration ? new Date(+new Date() + options.duration ?? 0) : undefined;
		const user = (await util.resolveNonCachedUser(options.user))!.id;
		const guild = client.guilds.resolveId(options.guild)!;
		const type = this.findTypeEnum(options.type)!;

		const entry = ActivePunishment.build(
			options.extraInfo
				? { user, type, guild, expires, modlog: options.modlog, extraInfo: options.extraInfo }
				: { user, type, guild, expires, modlog: options.modlog }
		);
		return await entry.save().catch(async (e) => {
			await util.handleError('createPunishmentEntry', e);
			return null;
		});
	}

	/**
	 * Destroys a punishment entry.
	 * @param options Options for destroying the punishment entry.
	 * @returns Whether or not the entry was destroyed.
	 */
	public static async removePunishmentEntry(options: RemovePunishmentEntryOptions): Promise<boolean> {
		const user = await util.resolveNonCachedUser(options.user);
		const guild = client.guilds.resolveId(options.guild);
		const type = this.findTypeEnum(options.type);

		if (!user || !guild) return false;

		let success = true;

		const entries = await ActivePunishment.findAll({
			// finding all cases of a certain type incase there were duplicates or something
			where: options.extraInfo
				? { user: user.id, guild: guild, type, extraInfo: options.extraInfo }
				: { user: user.id, guild: guild, type }
		}).catch(async (e) => {
			await util.handleError('removePunishmentEntry', e);
			success = false;
		});
		if (entries) {
			const promises = entries.map(async (entry) =>
				entry.destroy().catch(async (e) => {
					await util.handleError('removePunishmentEntry', e);
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
	private static findTypeEnum(type: 'mute' | 'ban' | 'role' | 'block') {
		const typeMap = {
			['mute']: ActivePunishmentType.MUTE,
			['ban']: ActivePunishmentType.BAN,
			['role']: ActivePunishmentType.ROLE,
			['block']: ActivePunishmentType.BLOCK
		};
		return typeMap[type];
	}

	public static punishmentToPresentTense(punishment: PunishmentTypeDM): PunishmentTypePresent {
		return punishMap[punishment];
	}

	public static punishmentToPastTense(punishment: PunishmentTypePresent): PunishmentTypeDM {
		return reversedPunishMap[punishment];
	}

	/**
	 * Notifies the specified user of their punishment.
	 * @param options Options for notifying the user.
	 * @returns Whether or not the dm was successfully sent.
	 */
	public static async punishDM(options: PunishDMOptions): Promise<boolean> {
		const ending = await options.guild.getSetting('punishmentEnding');
		const dmEmbed =
			ending && ending.length && options.sendFooter
				? new EmbedBuilder().setDescription(ending).setColor(util.colors.newBlurple)
				: undefined;

		const appealsEnabled = !!(
			(await options.guild.hasFeature('punishmentAppeals')) && (await options.guild.getLogChannel('appeals'))
		);

		let content = `You have been ${options.punishment} `;
		if (options.punishment.includes('blocked')) {
			assert(options.channel);
			content += `from <#${options.channel}> `;
		}
		content += `in ${util.format.input(options.guild.name)} `;
		if (options.duration !== null && options.duration !== undefined)
			content += options.duration ? `for ${util.humanizeDuration(options.duration)} ` : 'permanently ';
		const reason = options.reason?.trim() ? options.reason?.trim() : 'No reason provided';
		content += `for ${util.format.input(reason)}.`;

		let components;
		if (appealsEnabled && options.modlog)
			components = [
				new ActionRowBuilder<ButtonBuilder>({
					components: [
						new ButtonBuilder({
							customId: `appeal;${this.punishmentToPresentTense(options.punishment)};${options.guild.id};${client.users.resolveId(
								options.user
							)};${options.modlog}`,
							style: ButtonStyle.Primary,
							label: 'Appeal'
						}).toJSON()
					]
				})
			];

		const dmSuccess = await client.users
			.send(options.user, {
				content,
				embeds: dmEmbed ? [dmEmbed] : undefined,
				components
			})
			.catch(() => false);
		return !!dmSuccess;
	}
}

interface BaseCreateModLogEntryOptions {
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
 * Options for creating a modlog entry.
 */
export interface CreateModLogEntryOptions extends BaseCreateModLogEntryOptions {
	/**
	 * The user that a modlog entry is created for.
	 */
	user: BushGuildMemberResolvable;

	/**
	 * The moderator that created the modlog entry.
	 */
	moderator: BushGuildMemberResolvable;

	/**
	 * The guild that the punishment is created for.
	 */
	guild: BushGuildResolvable;
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
 * Options for creating a punishment entry.
 */
export interface CreatePunishmentEntryOptions {
	/**
	 * The type of punishment.
	 */
	type: 'mute' | 'ban' | 'role' | 'block';

	/**
	 * The user that the punishment is created for.
	 */
	user: BushGuildMemberResolvable;

	/**
	 * The length of time the punishment lasts for.
	 */
	duration: number | undefined;

	/**
	 * The guild that the punishment is created for.
	 */
	guild: BushGuildResolvable;

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
 * Options for removing a punishment entry.
 */
export interface RemovePunishmentEntryOptions {
	/**
	 * The type of punishment.
	 */
	type: 'mute' | 'ban' | 'role' | 'block';

	/**
	 * The user that the punishment is destroyed for.
	 */
	user: BushGuildMemberResolvable;

	/**
	 * The guild that the punishment was in.
	 */
	guild: BushGuildResolvable;

	/**
	 * Extra information for the punishment. The role for role punishments and the channel for blocks.
	 */
	extraInfo?: Snowflake;
}

/**
 * Options for sending a user a punishment dm.
 */
export interface PunishDMOptions {
	/**
	 * The modlog case id so the user can make an appeal.
	 */
	modlog?: string;

	/**
	 * The guild that the punishment is taking place in.
	 */
	guild: BushGuild;

	/**
	 * The user that is being punished.
	 */
	user: BushUserResolvable;

	/**
	 * The punishment that the user has received.
	 */
	punishment: PunishmentTypeDM;

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
}

export type PunishmentTypeDM =
	| 'warned'
	| 'muted'
	| 'unmuted'
	| 'kicked'
	| 'banned'
	| 'unbanned'
	| 'timedout'
	| 'untimedout'
	| 'blocked'
	| 'unblocked';

export type PunishmentTypePresent =
	| 'warn'
	| 'mute'
	| 'unmute'
	| 'kick'
	| 'ban'
	| 'unban'
	| 'timeout'
	| 'untimeout'
	| 'block'
	| 'unblock';

export type AppealButtonId = `appeal;${PunishmentTypePresent};${Snowflake};${Snowflake};${string}`;
