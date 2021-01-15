import { CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { Message } from 'discord.js';
import { BotCommand, PermissionLevel } from './BotCommand';
import BotClient from './BotClient';
import { CommandHandlerEvents } from 'discord-akairo/src/util/Constants';

export class BotCommandHandler extends CommandHandler {
	public constructor(client: BotClient, options: CommandHandlerOptions) {
		super(client, options);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
	public async runCommand(message: Message, command: BotCommand, args: any): Promise<void> {
		switch (command.permissionLevel) {
			case PermissionLevel.Default: {
				await super.runCommand(message, command, args);
				break;
			}
			case PermissionLevel.Superuser: {
				if (!((this.client as BotClient).config.superUsers.includes(message.author.id) || this.client.ownerID.includes(message.author.id))) {
					super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, 'superuser');
				} else {
					await super.runCommand(message, command, args);
				}
				break;
			}
			case PermissionLevel.Owner: {
				await super.runCommand(message, command, args);
				break;
			}
		}
	}
}
