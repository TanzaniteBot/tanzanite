/* eslint-disable @typescript-eslint/no-unused-vars */
import { GuildMember } from 'discord.js';
import { BushClient, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';

interface BushPunishmentOptions {
	reason?: string;
	moderator: BushUserResolvable;
	createModLogEntry?: boolean;
}

interface BushTimedPunishmentOptions extends BushPunishmentOptions {
	duration?: number;
}

type PunishmentResponse = 'success';

type WarnResponse = PunishmentResponse;

type MuteResponse = PunishmentResponse | 'no mute role';

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

	public async mute(options: BushTimedPunishmentOptions): Promise<MuteResponse> {
		throw 'not implemented';
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
