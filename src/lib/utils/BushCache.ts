import { Snowflake } from 'discord.js';

class GlobalCache {
	public static superUsers = new Array<Snowflake>();
	public static disabledCommands = new Array<string>();
	public static blacklistedChannels = new Array<Snowflake>();
	public static blacklistedGuilds = new Array<Snowflake>();
	public static blacklistedUsers = new Array<Snowflake>();
}

export class BushCache {
	public static global = GlobalCache;
}
