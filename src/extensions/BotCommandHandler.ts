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
		const logCommand = chalk.bgCyan(command.id)
		const logUser = chalk.bgBlueBright(message.author.tag)
		const logGuild = chalk.bgBlue(message.guild.name)
		if (botoptions.verbose) {
			console.info(chalk.bgCyanBright(`[${functions.timeStamp()}]`)+`${logCommand} used by ${logUser} in ${logGuild}.`)
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
				const superUsers: string[] = typeof this.client.ownerID === 'string' ? [this.client.ownerID] : this.client.ownerID; //why isn't this used?
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
