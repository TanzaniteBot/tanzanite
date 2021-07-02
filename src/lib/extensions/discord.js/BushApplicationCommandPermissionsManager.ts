import {
	ApplicationCommand,
	ApplicationCommandManager,
	ApplicationCommandPermissionsManager,
	GuildApplicationCommandManager
} from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushApplicationCommandManager } from './BushApplicationCommandManager';
import { BushGuildApplicationCommandManager } from './BushGuildApplicationCommandManager';

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
