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
import BuiltInReasons from 'discord-akairo/src/util/constants';

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
				break;
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
					break;
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
				}
			}
		}
		if (command.channel === 'guild' && !message.guild) {
			this.emit(
				CommandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				BuiltInReasons.GUILD
			);
			return true;
		}

		if (command.channel === 'dm' && message.guild) {
			this.emit(
				CommandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				BuiltInReasons.DM
			);
			return true;
		}

		if (await this.runPermissionChecks(message, command)) {
			return true;
		}

		const reason = this.inhibitorHandler
			? await this.inhibitorHandler.test('post', message, command)
			: null;

		if (reason != null) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
			return true;
		}

		if (this.runCooldowns(message, command)) {
			return true;
		}

		return false;
	}

	public async runCommand(
		message: Message,
		command: BushCommand,
		args: unknown
	): Promise<void> {
		await super.runCommand(message, command, args);
	}
}
