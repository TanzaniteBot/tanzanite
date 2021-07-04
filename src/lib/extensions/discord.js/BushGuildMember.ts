/* eslint-disable @typescript-eslint/no-unused-vars */
import { GuildMember, RoleResolvable } from 'discord.js';
import { ModLogType } from '../../models';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';

interface BushPunishmentOptions {
	reason?: string;
	moderator: BushUserResolvable;
}

interface BushTimedPunishmentOptions extends BushPunishmentOptions {
	duration?: number;
}

interface BushPunishmentRoleOptions extends BushTimedPunishmentOptions {
	role: RoleResolvable;
}

type PunishmentResponse = 'success';

type WarnResponse = PunishmentResponse;

type PunishmentRoleResponse = PunishmentResponse;

type MuteResponse =
	| PunishmentResponse
	| 'missing permissions'
	| 'no mute role'
	| 'invalid mute role'
	| 'mute role not manageable'
	| 'error giving mute role'
	| 'error creating modlog entry'
	| 'error creating mute entry'
	| 'failed to dm';

type UnmuteResponse = PunishmentResponse;

type KickResponse = PunishmentResponse;

interface BushBanOptions extends BushTimedPunishmentOptions {
	deleteDays?: number;
	duration?: number;
}

type BanResponse = PunishmentResponse;

export class BushGuildMember extends GuildMember {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare user: BushUser;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}

	public async warn(options: BushPunishmentOptions): Promise<WarnResponse> {
		throw 'not implemented';
	}

	public punishRole(options: BushPunishmentRoleOptions): Promise<PunishmentRoleResponse> {
		throw 'not implemented';
	}

	public async mute(options: BushTimedPunishmentOptions): Promise<MuteResponse> {
		//checks
		if (!this.guild.me.permissions.has('MANAGE_ROLES')) return 'missing permissions';
		const muteRoleID = await this.guild.getSetting('muteRole');
		if (!muteRoleID) return 'no mute role';
		const muteRole = this.guild.roles.cache.get(muteRoleID);
		if (!muteRole) return 'invalid mute role';
		if (muteRole.position >= this.guild.me.roles.highest.position || muteRole.managed) return 'mute role not manageable';

		//add role
		const success = await this.roles.add(muteRole).catch(() => null);
		if (!success) return 'error giving mute role';

		//add modlog entry
		const modlog = await this.client.util
			.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_MUTE : ModLogType.PERM_MUTE,
				user: this,
				moderator: options.moderator,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild
			})
			.catch(() => null);
		if (!modlog) return 'error creating modlog entry';

		// add punishment entry so they can be unmuted later
		const mute = await this.client.util
			.createPunishmentEntry({
				type: 'mute',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			})
			.catch(() => null);
		if (!mute) return 'error creating mute entry';

		//dm user
		const ending = this.guild.getSetting('punishmentEnding');
		const dmSuccess = await this.send({
			content: `You have been muted ${
				options.duration ? 'for ' + this.client.util.humanizeDuration(options.duration) : 'permanently'
			} in **${this.guild}** for **${options.reason || 'No reason provided'}**.${ending ? `\n\n${ending}` : ''}`
		}).catch(() => null);

		if (!dmSuccess) return 'failed to dm';

		return 'success';
	}

	public async unmute(options: BushPunishmentOptions): Promise<UnmuteResponse> {
		throw 'not implemented';
	}

	public async bushKick(options: BushPunishmentOptions): Promise<KickResponse> {
		throw 'not implemented';
	}

	public async bushBan(options?: BushBanOptions): Promise<BanResponse> {
		throw 'not implemented';
	}

	public isOwner(): boolean {
		return this.client.isOwner(this);
	}

	public isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}
