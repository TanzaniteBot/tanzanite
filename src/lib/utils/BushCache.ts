import { BadWords, GlobalModel, SharedModel, type Guild } from '#lib';
import { Collection, type Snowflake } from 'discord.js';

export class BushCache {
	public global = new GlobalCache();
	public shared = new SharedCache();
	public guilds = new GuildCache();
}

export class GlobalCache implements Omit<GlobalModel, 'environment'> {
	public disabledCommands: string[] = [];
	public blacklistedChannels: Snowflake[] = [];
	public blacklistedGuilds: Snowflake[] = [];
	public blacklistedUsers: Snowflake[] = [];
}

export class SharedCache implements Omit<SharedModel, 'primaryKey'> {
	public superUsers: Snowflake[] = [];
	public privilegedUsers: Snowflake[] = [];
	public badLinksSecret: string[] = [];
	public badLinks: string[] = [];
	public badWords: BadWords = {};
}

export class GuildCache extends Collection<Snowflake, Guild> {}
