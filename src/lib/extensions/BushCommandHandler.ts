import { CommandHandlerEvents } from 'discord-akairo/src/util/Constants';
import { Category, CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { BushCommand, PermissionLevel } from './BushCommand';
import { Message } from 'discord.js';
import BushClient from './BushClient';
import db from '../../constants/db';
import * as botoptions from '../../config/botoptions';
import log from '../../lib/utils/log';
import { Collection } from 'discord.js';

export class BushCommandHandler extends CommandHandler {
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
	}
	public categories: Collection<string, Category<string, BushCommand>>;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
	public async runCommand(message: Message, command: BushCommand, args: any): Promise<void> {
		if (botoptions.info) {
			log.info('Command', `The <<${command.id}>> command was used by <<${message.author.tag}>> in <<${message.guild?.name}>>`);
		}

		switch (command.permissionLevel) {
			case PermissionLevel.Default: {
				await super.runCommand(message, command, args);
				break;
			}
			case PermissionLevel.Superuser: {
				const superUsers: string[] = (await db.globalGet('superUsers', [])) as string[];
				if (!(superUsers.includes(message.author.id) || this.client.ownerID.includes(message.author.id))) {
					super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, 'superuser');
				} else {
					await super.runCommand(message, command, args);
				}
				break;
			}
			case PermissionLevel.Owner: {
				if (!botoptions.owners.includes(message.author.id)) {
					super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, 'owner');
				} else {
					await super.runCommand(message, command, args);
				}
				break;
			}
		}
	}
}
