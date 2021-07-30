import { ApplicationCommandData, CachedManager, Collection, FetchApplicationCommandOptions, Snowflake } from 'discord.js';
import { BushApplicationCommandResolvable, BushClient } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushApplicationCommandPermissionsManager } from './BushApplicationCommandPermissionsManager';
import { BushGuildResolvable } from './BushCommandInteraction';

export class BushApplicationCommandManager<
	ApplicationCommandType = BushApplicationCommand<{ guild: BushGuildResolvable }>,
	PermissionsOptionsExtras = { guild: BushGuildResolvable },
	PermissionsGuildType = null
> extends CachedManager<Snowflake, ApplicationCommandType, BushApplicationCommandResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public permissions: BushApplicationCommandPermissionsManager<
		{ command?: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		{ command: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		PermissionsOptionsExtras,
		PermissionsGuildType,
		null
	>;
	private commandPath({ id, guildId }: { id?: Snowflake; guildId?: Snowflake }): unknown;
	public create(command: ApplicationCommandData): Promise<ApplicationCommandType>;
	public create(command: ApplicationCommandData, guildId: Snowflake): Promise<BushApplicationCommand>;
	public delete(command: BushApplicationCommandResolvable, guildId?: Snowflake): Promise<ApplicationCommandType | null>;
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<ApplicationCommandType>;
	public edit(
		command: BushApplicationCommandResolvable,
		data: ApplicationCommandData,
		guildId: Snowflake
	): Promise<BushApplicationCommand>;
	public fetch(
		id: Snowflake,
		options: FetchApplicationCommandOptions & { guildId: Snowflake }
	): Promise<BushApplicationCommand>;
	public fetch(id: Snowflake, options?: FetchApplicationCommandOptions): Promise<ApplicationCommandType>;
	public fetch(
		id?: Snowflake,
		options?: FetchApplicationCommandOptions
	): Promise<Collection<Snowflake, ApplicationCommandType>>;
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, ApplicationCommandType>>;
	public set(commands: ApplicationCommandData[], guildId: Snowflake): Promise<Collection<Snowflake, BushApplicationCommand>>;
	private static transformCommand(command: ApplicationCommandData): unknown;
}
