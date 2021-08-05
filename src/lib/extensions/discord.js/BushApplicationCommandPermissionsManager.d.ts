import { APIApplicationCommandPermission } from 'discord-api-types';
import {
	ApplicationCommand,
	ApplicationCommandManager,
	ApplicationCommandPermissionData,
	ApplicationCommandPermissions,
	BaseManager,
	Collection,
	GuildApplicationCommandManager,
	GuildApplicationCommandPermissionData,
	Snowflake
} from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { BushClient, BushRoleResolvable, BushUserResolvable } from '../discord-akairo/BushClient';

export class BushApplicationCommandPermissionsManager<
	BaseOptions,
	FetchSingleOptions,
	FullPermissionsOptions,
	GuildType,
	CommandIdType
> extends BaseManager {
	public constructor(manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand);
	private manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand;

	public client: BushClient;
	public commandId: CommandIdType;
	public guild: GuildType;
	public guildId: Snowflake | null;
	public add(
		options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }
	): Promise<ApplicationCommandPermissions[]>;
	public has(options: FetchSingleOptions & { permissionId: BushUserResolvable | BushRoleResolvable }): Promise<boolean>;
	public fetch(options: FetchSingleOptions): Promise<ApplicationCommandPermissions[]>;
	public fetch(options: BaseOptions): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
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
	public set(
		options: FetchSingleOptions & { permissions: ApplicationCommandPermissionData[] }
	): Promise<ApplicationCommandPermissions[]>;
	public set(
		options: FullPermissionsOptions & {
			fullPermissions: GuildApplicationCommandPermissionData[];
		}
	): Promise<Collection<Snowflake, ApplicationCommandPermissions[]>>;
	private permissionsPath(guildId: Snowflake, commandId?: Snowflake): unknown;
	private static transformPermissions(
		permissions: ApplicationCommandPermissionData,
		received: true
	): Omit<APIApplicationCommandPermission, 'type'> & { type: keyof ApplicationCommandPermissionTypes };
	private static transformPermissions(permissions: ApplicationCommandPermissionData): APIApplicationCommandPermission;
}
