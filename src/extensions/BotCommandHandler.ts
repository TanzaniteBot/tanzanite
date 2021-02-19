import { CommandHandlerEvents } from 'discord-akairo/src/util/Constants';
import { CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { BotCommand, PermissionLevel } from './BotCommand';
import { Message } from 'discord.js';
import BotClient from './BotClient';

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
				const superUsers: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'superUsers', [])
				if (!(superUsers.includes(message.author.id) || this.client.ownerID.includes(message.author.id))) {
					super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, 'superuser');
				} else {
					await super.runCommand(message, command, args);
				}
				break;
			}
			case PermissionLevel.Owner: {
				const superUsers: string[] = typeof this.client.ownerID === 'string' ? [this.client.ownerID] : this.client.ownerID
				if (!this.client.ownerID.includes(message.author.id)) {
					super.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, 'owner');
				} else {
					await super.runCommand(message, command, args);
				}
				break;
			}
		}
	}
}
