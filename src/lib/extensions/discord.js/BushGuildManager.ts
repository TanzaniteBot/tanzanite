import type { BushClient, BushGuild, BushGuildResolvable } from '#lib';
import {
	CachedManager,
	GuildManager,
	type Collection,
	type FetchGuildOptions,
	type FetchGuildsOptions,
	type GuildCreateOptions,
	type OAuth2Guild,
	type Snowflake
} from 'discord.js';
import { type RawGuildData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for Guilds and stores their cache.
 */
export declare class BushGuildManager extends CachedManager<Snowflake, BushGuild, BushGuildResolvable> implements GuildManager {
	public constructor(client: BushClient, iterable?: Iterable<RawGuildData>);

	/**
	 * Creates a guild.
	 * <warn>This is only available to bots in fewer than 10 guilds.</warn>
	 * @param name The name of the guild
	 * @param options Options for creating the guild
	 * @returns The guild that was created
	 */
	public create(name: string, options?: GuildCreateOptions): Promise<BushGuild>;

	/**
	 * Obtains one or multiple guilds from Discord, or the guild cache if it's already available.
	 * @param options The guild's id or options
	 */
	public fetch(options: Snowflake | FetchGuildOptions): Promise<BushGuild>;
	public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
