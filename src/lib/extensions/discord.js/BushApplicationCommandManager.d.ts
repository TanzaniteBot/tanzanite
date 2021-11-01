import {
	type BushApplicationCommand,
	type BushApplicationCommandPermissionsManager,
	type BushApplicationCommandResolvable,
	type BushClient,
	type BushGuildResolvable
} from '@lib';
import { type APIApplicationCommand } from 'discord-api-types';
import { CachedManager, type ApplicationCommandData, type Collection, type FetchApplicationCommandOptions, type Snowflake } from 'discord.js';

export class BushApplicationCommandManager<
	ApplicationCommandScope = BushApplicationCommand<{ guild: BushGuildResolvable }>,
	PermissionsOptionsExtras = { guild: BushGuildResolvable },
	PermissionsGuildType = null
> extends CachedManager<Snowflake, ApplicationCommandScope, BushApplicationCommandResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<unknown>);
	public permissions: BushApplicationCommandPermissionsManager<
		{ command?: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		{ command: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		PermissionsOptionsExtras,
		PermissionsGuildType,
		null
	>;
	private commandPath({ id, guildId }: { id?: Snowflake; guildId?: Snowflake }): unknown;
	public create(command: ApplicationCommandData): Promise<ApplicationCommandScope>;
	public create(command: ApplicationCommandData, guildId: Snowflake): Promise<BushApplicationCommand>;
	public delete(command: BushApplicationCommandResolvable, guildId?: Snowflake): Promise<ApplicationCommandScope | null>;
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<ApplicationCommandScope>;
	public edit(
		command: BushApplicationCommandResolvable,
		data: ApplicationCommandData,
		guildId: Snowflake
	): Promise<BushApplicationCommand>;
	public fetch(id: Snowflake, options: FetchApplicationCommandOptions & { guildId: Snowflake }): Promise<BushApplicationCommand>;
	public fetch(options: FetchApplicationCommandOptions): Promise<Collection<string, ApplicationCommandScope>>;
	public fetch(id: Snowflake, options?: FetchApplicationCommandOptions): Promise<ApplicationCommandScope>;
	public fetch(id?: Snowflake, options?: FetchApplicationCommandOptions): Promise<Collection<Snowflake, ApplicationCommandScope>>;
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, ApplicationCommandScope>>;
	public set(commands: ApplicationCommandData[], guildId: Snowflake): Promise<Collection<Snowflake, BushApplicationCommand>>;
	private static transformCommand(
		command: ApplicationCommandData
	): Omit<APIApplicationCommand, 'id' | 'application_id' | 'guild_id'>;
}
