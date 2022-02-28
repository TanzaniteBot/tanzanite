import type {
	BushApplicationCommand,
	BushApplicationCommandPermissionsManager,
	BushApplicationCommandResolvable,
	BushClient,
	BushGuildResolvable,
	StripPrivate
} from '#lib';
import type { APIApplicationCommand } from 'discord-api-types/v9';
import {
	ApplicationCommandManager,
	CachedManager,
	type ApplicationCommandData,
	type Collection,
	type FetchApplicationCommandOptions,
	type Snowflake
} from 'discord.js';

/**
 * Manages API methods for application commands and stores their cache.
 */
export declare class BushApplicationCommandManager<
		ApplicationCommandScope = BushApplicationCommand<{ guild: BushGuildResolvable }>,
		PermissionsOptionsExtras = { guild: BushGuildResolvable },
		PermissionsGuildType = null
	>
	extends CachedManager<Snowflake, ApplicationCommandScope, BushApplicationCommandResolvable>
	implements StripPrivate<ApplicationCommandManager<ApplicationCommandScope, PermissionsOptionsExtras, PermissionsGuildType>>
{
	public constructor(client: BushClient, iterable?: Iterable<unknown>);

	/**
	 * The manager for permissions of arbitrary commands on arbitrary guilds
	 */
	public permissions: BushApplicationCommandPermissionsManager<
		{ command?: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		{ command: BushApplicationCommandResolvable } & PermissionsOptionsExtras,
		PermissionsOptionsExtras,
		PermissionsGuildType,
		null
	>;

	/**
	 * The APIRouter path to the commands
	 * @param id The application command's id
	 * @param guildId The guild's id to use in the path,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 */
	private commandPath({ id, guildId }: { id?: Snowflake; guildId?: Snowflake }): unknown;

	/**
	 * Creates an application command.
	 * @param command The command
	 * @param guildId The guild's id to create this command in, ignored when using a {@link GuildApplicationCommandManager}
	 * @example
	 * // Create a new command
	 * client.application.commands.create({
	 *   name: 'test',
	 *   description: 'A test command',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public create(command: BushApplicationCommandResolvable, guildId?: Snowflake): Promise<ApplicationCommandScope>;

	/**
	 * Deletes an application command.
	 * @param command The command to delete
	 * @param guildId The guild's id where the command is registered,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @example
	 * // Delete a command
	 * guild.commands.delete('123456789012345678')
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public delete(command: BushApplicationCommandResolvable, guildId?: Snowflake): Promise<ApplicationCommandScope | null>;

	/**
	 * Edits an application command.
	 * @param command The command to edit
	 * @param data The data to update the command with
	 * @param guildId The guild's id where the command registered,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @example
	 * // Edit an existing command
	 * client.application.commands.edit('123456789012345678', {
	 *   description: 'New description',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<ApplicationCommandScope>;
	public edit(
		command: BushApplicationCommandResolvable,
		data: ApplicationCommandData,
		guildId: Snowflake
	): Promise<BushApplicationCommand>;

	/**
	 * Obtains one or multiple application commands from Discord, or the cache if it's already available.
	 * @param id The application command's id
	 * @param  options Additional options for this fetch
	 * @example
	 * // Fetch a single command
	 * client.application.commands.fetch('123456789012345678')
	 *   .then(command => console.log(`Fetched command ${command.name}`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch all commands
	 * guild.commands.fetch()
	 *   .then(commands => console.log(`Fetched ${commands.size} commands`))
	 *   .catch(console.error);
	 */
	public fetch(id: Snowflake, options: FetchApplicationCommandOptions & { guildId: Snowflake }): Promise<BushApplicationCommand>;
	public fetch(options: FetchApplicationCommandOptions): Promise<Collection<string, ApplicationCommandScope>>;
	public fetch(id: Snowflake, options?: FetchApplicationCommandOptions): Promise<ApplicationCommandScope>;
	public fetch(id?: Snowflake, options?: FetchApplicationCommandOptions): Promise<Collection<Snowflake, ApplicationCommandScope>>;

	/**
	 * Sets all the commands for this application or guild.
	 * @param commands The commands
	 * @param guildId The guild's id to create the commands in,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @example
	 * // Set all commands to just this one
	 * client.application.commands.set([
	 *   {
	 *     name: 'test',
	 *     description: 'A test command',
	 *   },
	 * ])
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Remove all commands
	 * guild.commands.set([])
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, ApplicationCommandScope>>;
	public set(commands: ApplicationCommandData[], guildId: Snowflake): Promise<Collection<Snowflake, BushApplicationCommand>>;

	/**
	 * Transforms an {@link ApplicationCommandData} object into something that can be used with the API.
	 * @param command The command to transform
	 */
	private static transformCommand(
		command: ApplicationCommandData
	): Omit<APIApplicationCommand, 'id' | 'application_id' | 'guild_id'>;
}
