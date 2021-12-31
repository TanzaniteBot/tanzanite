/* eslint-disable @typescript-eslint/ban-types */
import {
	BushApplicationCommandManager,
	type BushApplicationCommand,
	type BushApplicationCommandResolvable,
	type BushClient,
	type BushGuild
} from '#lib';
import type { ApplicationCommandData, BaseFetchOptions, Collection, Snowflake } from 'discord.js';
import type { RawApplicationCommandData } from 'discord.js/typings/rawDataTypes';

/**
 * An extension for guild-specific application commands.
 */
export class BushGuildApplicationCommandManager extends BushApplicationCommandManager<BushApplicationCommand, {}, BushGuild> {
	public constructor(guild: BushGuild, iterable?: Iterable<RawApplicationCommandData>);
	public declare readonly client: BushClient;

	/**
	 * The guild that this manager belongs to
	 */
	public guild: BushGuild;

	/**
	 * Creates an application command.
	 * @param command The command
	 * @param guildId The guild's id to create this command in,
	 * ignored when using a {@link GuildApplicationCommandManager}
	 * @example
	 * // Create a new command
	 * client.application.commands.create({
	 *   name: 'test',
	 *   description: 'A test command',
	 * })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public create(command: BushApplicationCommandResolvable): Promise<BushApplicationCommand>;

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
	public delete(command: BushApplicationCommandResolvable): Promise<BushApplicationCommand | null>;

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
	public edit(command: BushApplicationCommandResolvable, data: ApplicationCommandData): Promise<BushApplicationCommand>;

	/**
	 * Obtains one or multiple application commands from Discord, or the cache if it's already available.
	 * @param id The application command's id
	 * @param options Additional options for this fetch
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
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushApplicationCommand>;
	public fetch(options: BaseFetchOptions): Promise<Collection<Snowflake, BushApplicationCommand>>;
	public fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, BushApplicationCommand>>;

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
	public set(commands: ApplicationCommandData[]): Promise<Collection<Snowflake, BushApplicationCommand>>;
}
