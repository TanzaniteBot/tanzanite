import { CommandHandlerEvents } from 'discord-akairo/src/util/Constants';
import {
	Category,
	CommandHandler,
	CommandHandlerOptions
} from 'discord-akairo';
import { BushCommand, PermissionLevel } from './BushCommand';
import { Message } from 'discord.js';
import BushClient from './BushClient';
import db from '../../constants/db';
import * as botoptions from '../../config/botoptions';
import { Collection } from 'discord.js';

export class BushCommandHandler extends CommandHandler {
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
	}
	public categories: Collection<string, Category<string, BushCommand>>;

	public async runPostTypeInhibitors(
		message: Message,
		command: BushCommand
	): Promise<boolean> {
		switch (command.permissionLevel) {
			case PermissionLevel.Default: {
				await super.runPostTypeInhibitors(message, command);
				return false;
			}
			case PermissionLevel.Superuser: {
				const superUsers: string[] = (await db.globalGet(
					'superUsers',
					[]
				)) as string[];
				if (
					!(
						superUsers.includes(message.author.id) ||
						this.client.ownerID.includes(message.author.id)
					)
				) {
					super.emit(
						CommandHandlerEvents.COMMAND_BLOCKED,
						message,
						command,
						'superuser'
					);
					return true;
				} else {
					await super.runPostTypeInhibitors(message, command);
					return false;
				}
			}
			case PermissionLevel.Owner: {
				if (!botoptions.owners.includes(message.author.id)) {
					super.emit(
						CommandHandlerEvents.COMMAND_BLOCKED,
						message,
						command,
						'owner'
					);
					return true;
				} else {
					await super.runPostTypeInhibitors(message, command);
					return false;
				}
			}
		}
	}

	public async runCommand(
		message: Message,
		command: BushCommand,
		args: unknown
	): Promise<void> {
		await super.runCommand(message, command, args);
	}
}
