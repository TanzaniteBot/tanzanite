import { GuildBan } from 'discord.js';
import { RawGuildBanData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';

export class BushGuildBan extends GuildBan {
	public constructor(client: BushClient, data: RawGuildBanData, guild: BushGuild);
	public guild: BushGuild;
	public user: BushUser;
	public readonly partial: boolean;
	public reason?: string | null;
	public fetch(force?: boolean): Promise<BushGuildBan>;
}
