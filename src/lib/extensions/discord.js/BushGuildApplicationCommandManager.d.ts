/* eslint-disable @typescript-eslint/ban-types */
import {
	BushApplicationCommandManager,
	type BushApplicationCommand,
	type BushApplicationCommandResolvable,
	type BushClient,
	type BushGuild
} from '@lib';
import { type ApplicationCommandData, type BaseFetchOptions, type Collection, type Snowflake } from 'discord.js';
import { type RawApplicationCommandData } from 'discord.js/typings/rawDataTypes';

export class BushGuildApplicationCommandManager extends BushApplicationCommandManager<BushApplicationCommand, {}, BushGuild> {
	public constructor(guild: BushGuild, iterable?: Iterable<RawApplicationCommandData>);
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public create(command: ApplicationCommandData): Promise<BushApplicationCommand>;
	public delete(command: BushApplicationCommandResolvable): Promise<BushApplicationCommand | null>;
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<BushApplicationCommand>;
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushApplicationCommand>;
	public fetch(options: BaseFetchOptions): Promise<Collection<Snowflake, BushApplicationCommand>>;
	public fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, BushApplicationCommand>>;
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, BushApplicationCommand>>;
}
