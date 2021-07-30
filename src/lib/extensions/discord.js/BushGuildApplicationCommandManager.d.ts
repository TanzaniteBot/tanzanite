/* eslint-disable @typescript-eslint/ban-types */
import { ApplicationCommandData, BaseFetchOptions, Collection, Snowflake } from 'discord.js';
import { BushApplicationCommandResolvable, BushClient } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushApplicationCommandManager } from './BushApplicationCommandManager';
import { BushGuild } from './BushGuild';

export class BushGuildApplicationCommandManager extends BushApplicationCommandManager<BushApplicationCommand, {}, BushGuild> {
	public constructor(guild: BushGuild, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public create(command: ApplicationCommandData): Promise<BushApplicationCommand>;
	public delete(command: BushApplicationCommandResolvable): Promise<BushApplicationCommand | null>;
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<BushApplicationCommand>;
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushApplicationCommand>;
	public fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, BushApplicationCommand>>;
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, BushApplicationCommand>>;
}
