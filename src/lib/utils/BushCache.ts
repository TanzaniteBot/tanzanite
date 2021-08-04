import { Collection, Snowflake } from 'discord.js';
import { Guild } from '../models/Guild';

export class BushCache {
	public static global = {
		superUsers: new Array<Snowflake>(),
		disabledCommands: new Array<string>(),
		blacklistedChannels: new Array<Snowflake>(),
		blacklistedGuilds: new Array<Snowflake>(),
		blacklistedUsers: new Array<Snowflake>()
	};
	public static guilds = new Collection<Snowflake, Guild>();
}
