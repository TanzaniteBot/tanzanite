import type { BushClient, BushRoleResolvable, BushUserResolvable } from '#lib';
import type { APIApplicationCommandPermission } from 'discord-api-types/v9';
import {
	ApplicationCommandPermissionType,
	BaseManager,
	type ApplicationCommand,
	type ApplicationCommandManager,
	type ApplicationCommandPermissionData,
	type ApplicationCommandPermissions,
	type Collection,
	type GuildApplicationCommandManager,
	type GuildApplicationCommandPermissionData,
	type Snowflake
} from 'discord.js';

/**
 * Manages API methods for permissions of Application Commands.
 */
export declare class BushApplicationCommandPermissionsManager<
	BaseOptions,
	FetchSingleOptions,
	FullPermissionsOptions,
	GuildType,
	CommandIdType
> extends BaseManager {
	public constructor(manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand);

	/**
	 * The manager or command that this manager belongs to
	 */
	private manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand;

	/**
	 * The client that instantiated this Manager
	 */
	public client: BushClient;

	/**
	 * The id of the command this manager acts on
	 */
	public commandId: CommandIdType;

	/**
	 * The guild that this manager acts on
	 */
	public guild: GuildType;

	/**
	 * The id of the guild that this manager acts on
	 */
	public guildId: Snowflake | null;

	/**
	 * Add permissions to a command.
	 * @param options Options used to add permissions
	 * @example
	 * // Block a role from the command permissions
	 * guild.commands.permissions.add({ command: '123456789012345678', permissions: [
	 *   {
	 *     id: '876543211234567890',
	 *     type: 'ROLE',
	 *     permission: false
	 *   },
	 * ]})
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public add(
		options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }
	): Promise<ApplicationCommandPermissions[]>;

	/**
	 * Check whether a permission exists for a user or role
	 * @param options Options used to check permissions
	 * @example
	 * // Check whether a user has permission to use a command
	 * guild.commands.permissions.has({ command: '123456789012345678', permissionId: '876543210123456789' })
	 *  .then(console.log)
	 *  .catch(console.error);
	 */
	public has(options: FetchSingleOptions & { permissionId: BushUserResolvable | BushRoleResolvable }): Promise<boolean>;

	/**
	 * Fetches the permissions for one or multiple commands.
	 * @param options Options used to fetch permissions
	 * @example
	 * // Fetch permissions for one command
	 * guild.commands.permissions.fetch({ command: '123456789012345678' })
	 *   .then(perms => console.log(`Fetched permissions for ${perms.length} users`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch permissions for all commands in a guild
	 * client.application.commands.permissions.fetch({ guild: '123456789012345678' })
	 *   .then(perms => console.log(`Fetched permissions for ${perms.size} commands`))
	 *   .catch(console.error);
	 */
	public fetch(options: FetchSingleOptions): Promise<ApplicationCommandPermissions[]>;
	public fetch(options: BaseOptions): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;

	/**
	 * Remove permissions from a command.
	 * @param options Options used to remove permissions
	 * @example
	 * // Remove a user permission from this command
	 * guild.commands.permissions.remove({ command: '123456789012345678', users: '876543210123456789' })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Remove multiple roles from this command
	 * guild.commands.permissions.remove({
	 *   command: '123456789012345678', roles: ['876543210123456789', '765432101234567890']
	 * })
	 *    .then(console.log)
	 *    .catch(console.error);
	 */
	public remove(
		options:
			| (FetchSingleOptions & {
					users: BushUserResolvable | BushUserResolvable[];
					roles?: BushRoleResolvable | BushRoleResolvable[];
			  })
			| (FetchSingleOptions & {
					users?: BushUserResolvable | BushUserResolvable[];
					roles: BushRoleResolvable | BushRoleResolvable[];
			  })
	): Promise<ApplicationCommandPermissions[]>;

	/**
	 * Sets the permissions for one or more commands.
	 * @param options Options used to set permissions
	 * @example
	 * // Set the permissions for one command
	 * client.application.commands.permissions.set({ guild: '892455839386304532', command: '123456789012345678',
	 *  permissions: [
	 *    {
	 *      id: '876543210987654321',
	 *      type: 'USER',
	 *      permission: false,
	 *    },
	 * ]})
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Set the permissions for all commands
	 * guild.commands.permissions.set({ fullPermissions: [
	 *   {
	 *     id: '123456789012345678',
	 *     permissions: [{
	 *       id: '876543210987654321',
	 *       type: 'USER',
	 *       permission: false,
	 *     }],
	 *   },
	 * ]})
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public set(
		options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }
	): Promise<ApplicationCommandPermissions[]>;
	public set(
		options: FullPermissionsOptions & {
			fullPermissions: GuildApplicationCommandPermissionData[];
		}
	): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;

	/**
	 * The APIRouter path to the commands
	 * @param guildId The guild's id to use in the path,
	 * @param commandId The application command's id
	 */
	private permissionsPath(guildId: Snowflake, commandId?: Snowflake): unknown;

	/**
	 * Transforms an {@link ApplicationCommandPermissionData} object into something that can be used with the API.
	 * @param permissions The permissions to transform
	 * @param received Whether these permissions have been received from Discord
	 */
	private static transformPermissions(
		permissions: ApplicationCommandPermissionData,
		received: true
	): Omit<APIApplicationCommandPermission, 'type'> & { type: keyof ApplicationCommandPermissionType };
	private static transformPermissions(permissions: ApplicationCommandPermissionData): APIApplicationCommandPermission;
}
