import { Snowflake } from 'discord.js';

export class BushCache {
	public static superUsers = new Array<Snowflake>();
	public static disabledCommands = new Array<string>();
	public static blacklistedChannels = new Array<Snowflake>();
	public static blacklistedGuilds = new Array<Snowflake>();
	public static blacklistedUsers = new Array<Snowflake>();
}
