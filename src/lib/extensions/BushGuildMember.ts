import { GuildMember } from 'discord.js';
import { BushClient } from './BushClient';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';

export class BushGuildMember extends GuildMember {
	public declare client: BushClient;
	public declare guild: BushGuild;
	public declare BushUser: BushUser;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}
}
