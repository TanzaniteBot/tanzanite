import {
	ApplicationCommand,
	ApplicationCommandManager,
	ApplicationCommandPermissionsManager,
	GuildApplicationCommandManager
} from 'discord.js';
import { BushApplicationCommand, BushApplicationCommandManager, BushClient, BushGuildApplicationCommandManager } from '..';

export class BushApplicationCommandPermissionsManager<
	BaseOptions,
	FetchSingleOptions,
	FullPermissionsOptions,
	GuildType,
	CommandIdType
> extends ApplicationCommandPermissionsManager<
	BaseOptions,
	FetchSingleOptions,
	FullPermissionsOptions,
	GuildType,
	CommandIdType
> {
	public client: BushClient;
	public manager: BushApplicationCommandManager | BushGuildApplicationCommandManager | BushApplicationCommand;

	public constructor(manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand) {
		super(manager);
	}
}
