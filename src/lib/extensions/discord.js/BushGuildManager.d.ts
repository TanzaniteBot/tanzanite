import { Snowflake } from 'discord-api-types';
import { CachedManager, Collection, FetchGuildOptions, FetchGuildsOptions, GuildCreateOptions, OAuth2Guild } from 'discord.js';
import { RawGuildData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuildResolvable } from './BushCommandInteraction';
import { BushGuild } from './BushGuild';

export class BushGuildManager extends CachedManager<Snowflake, BushGuild, BushGuildResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<RawGuildData>);
	public create(name: string, options?: GuildCreateOptions): Promise<BushGuild>;
	public fetch(options: Snowflake | FetchGuildOptions): Promise<BushGuild>;
	public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
