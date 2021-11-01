import { type BushClient, type BushGuild, type BushUser } from '@lib';
import { GuildBan } from 'discord.js';
import { type RawGuildBanData } from 'discord.js/typings/rawDataTypes';

export class BushGuildBan extends GuildBan {
	public constructor(client: BushClient, data: RawGuildBanData, guild: BushGuild);
	public guild: BushGuild;
	public user: BushUser;
	public readonly partial: boolean;
	public reason?: string | null;
	public fetch(force?: boolean): Promise<BushGuildBan>;
}
