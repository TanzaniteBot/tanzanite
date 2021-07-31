import { Snowflake } from 'discord-api-types';
import {
	CachedManager,
	Collection,
	FetchGuildOptions,
	FetchGuildsOptions,
	Guild,
	GuildCreateOptions,
	OAuth2Guild
} from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuildResolvable } from './BushCommandInteraction';
import { BushGuild } from './BushGuild';

export class BushGuildManager extends CachedManager<Snowflake, BushGuild, BushGuildResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<unknown>);
	public create(name: string, options?: GuildCreateOptions): Promise<Guild>;
	public fetch(options: Snowflake | FetchGuildOptions): Promise<BushGuild>;
	public fetch(options?: FetchGuildsOptions): Promise<Collection<Snowflake, OAuth2Guild>>;
}
