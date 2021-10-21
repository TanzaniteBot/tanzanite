import { Snowflake } from 'discord-api-types';
import {
	ActivePunishment,
	ActivePunishmentType,
	BushGuildMember,
	BushGuildMemberResolvable,
	BushGuildResolvable,
	Guild,
	ModLog,
	ModLogType
} from '..';

export class Moderation {
	/**
	 * Checks if a moderator can perform a moderation action on another user.
	 * @param moderator - The person trying to perform the action.
	 * @param victim - The person getting punished.
	 * @param type - The type of punishment - used to format the response.
	 * @param checkModerator - Whether or not to check if the victim is a moderator.
	 */
	public static async permissionCheck(
		moderator: BushGuildMember,
		victim: BushGuildMember,
		type: 'mute' | 'unmute' | 'warn' | 'kick' | 'ban' | 'unban' | 'add a punishment role to' | 'remove a punishment role from',
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
		if (checkModerator && victim.permissions.has('MANAGE_MESSAGES') && !(type.startsWith('un') && moderator.id === victim.id)) {
			if (await moderator.guild.hasFeature('modsCanPunishMods')) {
				return true;
			} else {
				return `${util.emojis.error} You cannot ${type} **${victim.user.tag}** because they are a moderator.`;
			}
		}
		return true;
	}

	public static async createModLogEntry(
		options: {
			type: ModLogType;
			user: BushGuildMemberResolvable;
			moderator: BushGuildMemberResolvable;
			reason: string | undefined | null;
			duration?: number;
			guild: BushGuildResolvable;
			pseudo?: boolean;
			evidence?: string;
		},
		getCaseNumber = false
	): Promise<{ log: ModLog | null; caseNum: number | null }> {
		const user = (await util.resolveNonCachedUser(options.user))!.id;
		const moderator = (await util.resolveNonCachedUser(options.moderator))!.id;
		const guild = client.guilds.resolveId(options.guild)!;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		const duration = options.duration || undefined;

		// If guild does not exist create it so the modlog can reference a guild.
		await Guild.findOrCreate({
			where: {
				id: guild
			},
			defaults: {
				id: guild
			}
		});

		const modLogEntry = ModLog.build({
			type: options.type,
			user,
			moderator,
			reason: options.reason,
			duration: duration,
			guild,
			pseudo: options.pseudo ?? false,
			evidence: options.evidence
		});
		const saveResult: ModLog | null = await modLogEntry.save().catch(async (e) => {
			await util.handleError('createModLogEntry', e);
			return null;
		});

		if (!getCaseNumber) return { log: saveResult, caseNum: null };

		const caseNum = (await ModLog.findAll({ where: { type: options.type, user: user, guild: guild, hidden: 'false' } }))
			?.length;
		return { log: saveResult, caseNum };
	}

	public static async createPunishmentEntry(options: {
		type: 'mute' | 'ban' | 'role' | 'block';
		user: BushGuildMemberResolvable;
		duration: number | undefined;
		guild: BushGuildResolvable;
		modlog: string;
		extraInfo?: Snowflake;
	}): Promise<ActivePunishment | null> {
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

	public static async removePunishmentEntry(options: {
		type: 'mute' | 'ban' | 'role' | 'block';
		user: BushGuildMemberResolvable;
		guild: BushGuildResolvable;
		extraInfo?: Snowflake;
	}): Promise<boolean> {
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

	private static findTypeEnum(type: 'mute' | 'ban' | 'role' | 'block') {
		const typeMap = {
			['mute']: ActivePunishmentType.MUTE,
			['ban']: ActivePunishmentType.BAN,
			['role']: ActivePunishmentType.ROLE,
			['block']: ActivePunishmentType.BLOCK
		};
		return typeMap[type];
	}
}
