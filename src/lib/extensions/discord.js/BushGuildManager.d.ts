import type { BushClient, BushGuild, BushGuildResolvable } from '#lib';
import {
	CachedManager,
	type Collection,
	type FetchGuildOptions,
	type FetchGuildsOptions,
	type GuildCreateOptions,
	type OAuth2Guild,
	type Snowflake
} from 'discord.js';
import { type RawGuildData } from 'discord.js/typings/rawDataTypes';

export class BushGuildManager extends CachedManager<Snowflake, BushGuild, BushGuildResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<RawGuildData>);
	public create(name: string, options?: GuildCreateOptions): Promise<BushGuild>;
	public fetch(options: Snowflake | FetchGuildOptions): Promise<BushGuild>;
	public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
