import { Collection, type Snowflake } from 'discord.js';
import { Guild } from '../models/Guild.js';

export class BushCache {
	public global = new GlobalCache();
	public guilds = new Collection<Snowflake, Guild>();
}

export class GlobalCache {
	public superUsers: Snowflake[] = [];
	public disabledCommands: string[] = []
	public blacklistedChannels: Snowflake[] = [];
	public blacklistedGuilds: Snowflake[] = [];
	public blacklistedUsers: Snowflake[] = [];	
}
