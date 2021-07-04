import { GuildChannel } from 'discord.js';
import { BushClient, BushGuild } from '..';

export class BushGuildChannel extends GuildChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
