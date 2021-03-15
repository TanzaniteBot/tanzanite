import { CommandHandlerEvents } from 'discord-akairo/src/util/Constants';
import { CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { BotCommand, PermissionLevel } from './BotCommand';
import { Message } from 'discord.js';
import BotClient from './BotClient';
import db from '../constants/db';
import * as botoptions from '../config/botoptions';
import chalk from 'chalk';
import functions from '../constants/functions';

export class BotCommandHandler extends CommandHandler {
	public constructor(client: BotClient, options: CommandHandlerOptions) {
		super(client, options);
	}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
	public async runCommand(message: Message, command: BotCommand, args: any): Promise<void> {
		const logCommand = chalk.blueBright(command.id);
		const logUser = chalk.blueBright(message.author.tag);
		const logGuild = chalk.blueBright(message.guild?.name);
		if (botoptions.info) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[Info]')} The ${logCommand} command was used by ${logUser} in ${logGuild}.`);
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
