import { Command, CommandOptions } from 'discord-akairo';
import { BushCommandHandler } from './BushCommandHandler';
import BushClient, { MessageType } from './BushClient';
import { Message } from 'discord.js';

export enum PermissionLevel {
	Default,
	Superuser,
	Owner
}

export interface BushCommandOptions extends CommandOptions {
	permissionLevel?: PermissionLevel;

	hidden?: boolean;
}

export class BushCommand extends Command {
	public client = <BushClient>super.client;

	public handler = <BushCommandHandler>super.handler;

	public permissionLevel: PermissionLevel;

	public hidden: boolean;

	public log(message: MessageType): Promise<Message> {
		return this.client.log(message);
	}

	public error(message: MessageType): Promise<Message> {
		return this.client.error(message);
	}

	public constructor(id: string, options?: BushCommandOptions) {
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
