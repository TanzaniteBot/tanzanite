/* eslint-disable @typescript-eslint/no-unused-vars */
import { GuildMember, Role } from 'discord.js';
import { ModLogType } from '../../models/ModLog';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushRole } from './BushRole';
import { BushUser } from './BushUser';

interface BushPunishmentOptions {
	reason?: string;
	moderator?: BushUserResolvable;
}

interface BushTimedPunishmentOptions extends BushPunishmentOptions {
	duration?: number;
}

interface AddRoleOptions extends BushTimedPunishmentOptions {
	role: BushRole | Role;
	addToModlog: boolean;
}

interface RemoveRoleOptions extends BushTimedPunishmentOptions {
	role: BushRole | Role;
	addToModlog: boolean;
}

type PunishmentResponse = 'success' | 'error creating modlog entry' | 'failed to dm';

type WarnResponse = PunishmentResponse;

type AddRoleResponse =
	| PunishmentResponse
	| 'user hierarchy'
	| 'role managed'
	| 'client hierarchy'
	| 'error creating role entry'
	| 'error adding role';

type RemoveRoleResponse =
	| PunishmentResponse
	| 'user hierarchy'
	| 'role managed'
	| 'client hierarchy'
	| 'error removing role entry'
	| 'error removing role';

type MuteResponse =
	| PunishmentResponse
	| 'missing permissions'
	| 'no mute role'
	| 'invalid mute role'
	| 'mute role not manageable'
	| 'error giving mute role'
	| 'error creating mute entry';

type UnmuteResponse =
	| PunishmentResponse
	| 'missing permissions'
	| 'no mute role'
	| 'invalid mute role'
	| 'mute role not manageable'
	| 'error removing mute role'
	| 'error removing mute entry';

type KickResponse = PunishmentResponse | 'missing permissions' | 'error kicking';

interface BushBanOptions extends BushTimedPunishmentOptions {
	deleteDays?: number;
}

type BanResponse = PunishmentResponse | 'missing permissions' | 'error creating ban entry' | 'error banning';

export class BushGuildMember extends GuildMember {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare user: BushUser;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}

	public async warn(options: BushPunishmentOptions): Promise<{ result: WarnResponse; caseNum: number }> {
		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));
		// add modlog entry
		const result = await util
			.createModLogEntry(
				{
					type: ModLogType.WARN,
					user: this,
					moderator: moderator.id,
					reason: options.reason,
					guild: this.guild
				},
				true
			)
			.catch((e) => {
				void client.console.error('warn', e, true, 1);
				return { log: null, caseNum: null };
			});
		if (!result || !result.log) return { result: 'error creating modlog entry', caseNum: null };

		// dm user
		const ending = await this.guild.getSetting('punishmentEnding');
		const dmSuccess = await this.send({
			content: `You have been warned in **${this.guild}** for **${options.reason || 'No reason provided'}**.${
				ending ? `\n\n${ending}` : ''
			}`
		}).catch(() => null);

		if (!dmSuccess) return { result: 'failed to dm', caseNum: result.caseNum };

		return { result: 'success', caseNum: result.caseNum };
	}

	public async addRole(options: AddRoleOptions): Promise<AddRoleResponse> {
		const ifShouldAddRole = this.checkIfShouldAddRole(options.role);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		if (options.addToModlog) {
			const { log: modlog } = await util
				.createModLogEntry({
					type: options.duration ? ModLogType.TEMP_PUNISHMENT_ROLE : ModLogType.PERM_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A'
				})
				.catch(() => null);
			if (!modlog) return 'error creating modlog entry';

			const punishmentEntrySuccess = await util
				.createPunishmentEntry({
					type: 'role',
					user: this,
					guild: this.guild,
					duration: options.duration,
					modlog: modlog.id,
					extraInfo: options.role.id
				})
				.catch(() => null);
			if (!punishmentEntrySuccess) return 'error creating role entry';
		}

		const removeRoleSuccess = await this.roles.remove(options.role, `${moderator.tag}`);
		if (!removeRoleSuccess) return 'error adding role';

		return 'success';
	}

	public async removeRole(options: RemoveRoleOptions): Promise<RemoveRoleResponse> {
		const ifShouldAddRole = this.checkIfShouldAddRole(options.role);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		if (options.addToModlog) {
			const { log: modlog } = await util
				.createModLogEntry({
					type: ModLogType.PERM_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A'
				})
				.catch(() => null);
			if (!modlog) return 'error creating modlog entry';

			const punishmentEntrySuccess = await util
				.removePunishmentEntry({
					type: 'role',
					user: this,
					guild: this.guild
				})
				.catch(() => null);
			if (!punishmentEntrySuccess) return 'error removing role entry';
		}

		const removeRoleSuccess = await this.roles.remove(options.role, `${moderator.tag}`);
		if (!removeRoleSuccess) return 'error removing role';

		return 'success';
	}

	private checkIfShouldAddRole(role: BushRole | Role) {
		if (this.roles.highest.position <= role.position) {
			return `user hierarchy`;
		} else if (role.managed) {
			return `role managed`;
		} else if (this.guild.me.roles.highest.position <= role.position) {
			return `client hierarchy`;
		}
		return true;
	}

	public async mute(options: BushTimedPunishmentOptions): Promise<MuteResponse> {
		// checks
		if (!this.guild.me.permissions.has('MANAGE_ROLES')) return 'missing permissions';
		const muteRoleID = await this.guild.getSetting('muteRole');
		if (!muteRoleID) return 'no mute role';
		const muteRole = this.guild.roles.cache.get(muteRoleID);
		if (!muteRole) return 'invalid mute role';
		if (muteRole.position >= this.guild.me.roles.highest.position || muteRole.managed) return 'mute role not manageable';

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		// add role
		const muteSuccess = await this.roles
			.add(muteRole, `[Mute] ${moderator.tag} | ${options.reason || 'No reason provided.'}`)
			.catch(() => null);
		if (!muteSuccess) return 'error giving mute role';

		// add modlog entry
		const { log: modlog } = await util
			.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_MUTE : ModLogType.PERM_MUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';

		// add punishment entry so they can be unmuted later
		const punishmentEntrySuccess = await util
			.createPunishmentEntry({
				type: 'mute',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			})
			.catch(() => null);
		if (!punishmentEntrySuccess) return 'error creating mute entry';

		// dm user
		const ending = await this.guild.getSetting('punishmentEnding');
		const dmSuccess = await this.send({
			content: `You have been muted ${
				options.duration ? 'for ' + util.humanizeDuration(options.duration) : 'permanently'
			} in **${this.guild}** for **${options.reason || 'No reason provided'}**.${ending ? `\n\n${ending}` : ''}`
		}).catch(() => null);

		if (!dmSuccess) return 'failed to dm';

		return 'success';
	}

	public async unmute(options: BushPunishmentOptions): Promise<UnmuteResponse> {
		//checks
		if (!this.guild.me.permissions.has('MANAGE_ROLES')) return 'missing permissions';
		const muteRoleID = await this.guild.getSetting('muteRole');
		if (!muteRoleID) return 'no mute role';
		const muteRole = this.guild.roles.cache.get(muteRoleID);
		if (!muteRole) return 'invalid mute role';
		if (muteRole.position >= this.guild.me.roles.highest.position || muteRole.managed) return 'mute role not manageable';

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		//remove role
		const muteSuccess = await this.roles
			.remove(muteRole, `[Unmute] ${moderator.tag} | ${options.reason || 'No reason provided.'}`)
			.catch(() => null);
		if (!muteSuccess) return 'error removing mute role';

		//remove modlog entry
		const { log: modlog } = await util
			.createModLogEntry({
				type: ModLogType.UNMUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';

		// remove mute entry
		const removePunishmentEntrySuccess = await util
			.removePunishmentEntry({
				type: 'mute',
				user: this,
				guild: this.guild
			})
			.catch(() => null);
		if (!removePunishmentEntrySuccess) return 'error removing mute entry';

		//dm user
		const dmSuccess = await this.send({
			content: `You have been unmuted in **${this.guild}** because **${options.reason || 'No reason provided'}**.`
		}).catch(() => null);

		if (!dmSuccess) return 'failed to dm';

		return 'success';
	}

	public async bushKick(options: BushPunishmentOptions): Promise<KickResponse> {
		// checks
		if (!this.guild.me.permissions.has('KICK_MEMBERS') || !this.kickable) return 'missing permissions';

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		// dm user
		const ending = await this.guild.getSetting('punishmentEnding');
		const dmSuccess = await this.send({
			content: `You have been kicked from **${this.guild}** for **${options.reason || 'No reason provided'}**.${
				ending ? `\n\n${ending}` : ''
			}`
		}).catch(() => null);

		// kick
		const kickSuccess = await this.kick(`${moderator.tag} | ${options.reason || 'No reason provided.'}`).catch(() => null);
		if (!kickSuccess) return 'error kicking';

		// add modlog entry
		const { log: modlog } = await util
			.createModLogEntry({
				type: ModLogType.KICK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';
		if (!dmSuccess) return 'failed to dm';
		return 'success';
	}

	public async bushBan(options?: BushBanOptions): Promise<BanResponse> {
		// checks
		if (!this.guild.me.permissions.has('BAN_MEMBERS') || !this.bannable) return 'missing permissions';

		const moderator = client.users.cache.get(client.users.resolveId(options.moderator || client.user));

		// dm user
		const ending = await this.guild.getSetting('punishmentEnding');
		const dmSuccess = await this.send({
			content: `You have been banned ${
				options.duration ? 'for ' + util.humanizeDuration(options.duration) : 'permanently'
			} from **${this.guild}** for **${options.reason || 'No reason provided'}**.${ending ? `\n\n${ending}` : ''}`
		}).catch(() => null);

		// ban
		const banSuccess = await this.ban({
			reason: `${moderator.tag} | ${options.reason || 'No reason provided.'}`,
			days: options.deleteDays
		});
		if (!banSuccess) return 'error banning';

		// add modlog entry
		const { log: modlog } = await util
			.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_BAN : ModLogType.PERM_BAN,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';

		// add punishment entry so they can be unbanned later
		const punishmentEntrySuccess = await util
			.createPunishmentEntry({
				type: 'ban',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			})
			.catch(() => null);
		if (!punishmentEntrySuccess) return 'error creating ban entry';

		if (!dmSuccess) return 'failed to dm';
		return 'success';
	}

	public get isOwner(): boolean {
		return client.isOwner(this);
	}

	public get isSuperUser(): boolean {
		return client.isSuperUser(this);
	}
}
