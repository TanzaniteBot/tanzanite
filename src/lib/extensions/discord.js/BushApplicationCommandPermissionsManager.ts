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
	GuildType,
	CommandIDType
> extends ApplicationCommandPermissionsManager<BaseOptions, FetchSingleOptions, GuildType, CommandIDType> {
	public client: BushClient;
	public manager: BushApplicationCommandManager | BushGuildApplicationCommandManager | BushApplicationCommand;

	public constructor(manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand) {
		super(manager);
	}
}
