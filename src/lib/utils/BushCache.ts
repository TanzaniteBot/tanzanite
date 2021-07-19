import { Collection, Snowflake } from 'discord.js';
import { Guild } from '../models/Guild';

class GlobalCache {
	public static superUsers = new Array<Snowflake>();
	public static disabledCommands = new Array<string>();
	public static blacklistedChannels = new Array<Snowflake>();
	public static blacklistedGuilds = new Array<Snowflake>();
	public static blacklistedUsers = new Array<Snowflake>();
}


export class BushCache {
	public static global = GlobalCache;
	public static guilds = new Collection<Snowflake, Guild>()
}
