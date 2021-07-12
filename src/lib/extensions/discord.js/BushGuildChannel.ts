import { GuildChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';

export class BushGuildChannel extends GuildChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
