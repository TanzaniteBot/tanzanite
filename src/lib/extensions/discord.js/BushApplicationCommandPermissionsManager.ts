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
	public declare client: BushClient;
	public declare manager: BushApplicationCommandManager | BushGuildApplicationCommandManager | BushApplicationCommand;

	public constructor(manager: ApplicationCommandManager | GuildApplicationCommandManager | ApplicationCommand) {
		super(manager);
	}
}
