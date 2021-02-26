import { Command, CommandOptions } from 'discord-akairo';
import { BotCommandHandler } from './BotCommandHandler';
import BotClient, { MessageType } from './BotClient';
import { Message } from 'discord.js';

export enum PermissionLevel {
	Default,
	Superuser,
	Owner,
}

export interface BotCommandOptions extends CommandOptions {
	permissionLevel?: PermissionLevel;
}

export class BotCommand extends Command {
	public client = <BotClient>super.client;

	public handler = <BotCommandHandler>super.handler;

	public permissionLevel: PermissionLevel;

	public log(message: MessageType): Promise<Message> {
		return this.client.log(message);
	}

	public error(message: MessageType): Promise<Message> {
		return this.client.error(message);
	}

	public constructor(id: string, options?: BotCommandOptions) {
		super(id, options);
		if (!options.permissionLevel) {
			options.permissionLevel = PermissionLevel.Default;
		}
		if (options.ownerOnly) {
			options.permissionLevel = PermissionLevel.Owner;
		}
		if (options.permissionLevel == PermissionLevel.Owner) {
			options.ownerOnly = true;
		}
		this.permissionLevel = options.permissionLevel;
	}
}
