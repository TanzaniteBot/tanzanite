/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, CommandHandler, CommandHandlerEvents, CommandHandlerOptions } from 'discord-akairo';
import { Collection, PermissionString } from 'discord.js';
import { BushConstants } from '../../utils/BushConstants';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushSlashMessage } from './BushSlashMessage';

export type BushCommandHandlerOptions = CommandHandlerOptions;

const commandHandlerEvents = BushConstants.CommandHandlerEvents;
const blockedReasons = BushConstants.BlockedReasons;

export interface BushCommandHandlerEvents extends CommandHandlerEvents {
	commandBlocked: [message: BushMessage, command: BushCommand, reason: string];

	missingPermissions: [message: BushMessage, command: BushCommand, type: 'client' | 'user', missing: Array<PermissionString>];

	slashBlocked: [message: BushSlashMessage, command: BushCommand, reason: string];

	slashMissingPermissions: [
		message: BushSlashMessage,
		command: BushCommand,
		type: 'client' | 'user',
		missing: Array<PermissionString>
	];
}

export class BushCommandHandler extends CommandHandler {
	public declare client: BushClient;
	public declare modules: Collection<string, BushCommand>;
	public declare categories: Collection<string, Category<string, BushCommand>>;
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
	}

	public async runPostTypeInhibitors(message: BushMessage, command: BushCommand, slash = false): Promise<boolean> {
		if (command.ownerOnly) {
			const isOwner = client.isOwner(message.author);
			if (!isOwner) {
				this.emit(
					slash ? commandHandlerEvents.SLASH_BLOCKED : commandHandlerEvents.COMMAND_BLOCKED,
					message,
					command,
					blockedReasons.OWNER
				);
				return true;
			}
		}

		if (command.superUserOnly) {
			const isSuperUser = client.isSuperUser(message.author);
			if (!isSuperUser) {
				this.emit(
					slash ? commandHandlerEvents.SLASH_BLOCKED : commandHandlerEvents.COMMAND_BLOCKED,
					message,
					command,
					blockedReasons.OWNER
				);
				return true;
			}
		}

		if (command.channel === 'guild' && !message.guild) {
			this.emit(
				slash ? commandHandlerEvents.SLASH_BLOCKED : commandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				blockedReasons.GUILD
			);
			return true;
		}

		if (command.channel === 'dm' && message.guild) {
			this.emit(
				slash ? commandHandlerEvents.SLASH_BLOCKED : commandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				blockedReasons.DM
			);
			return true;
		}
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				this.emit(commandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.RESTRICTED_CHANNEL);
				return true;
			}
		}
		if (command.restrictedGuilds?.length && message.guild) {
			if (!command.restrictedGuilds.includes(message.guild.id)) {
				this.emit(commandHandlerEvents.COMMAND_BLOCKED, message, command, blockedReasons.RESTRICTED_GUILD);
				return true;
			}
		}
		if (await this.runPermissionChecks(message, command)) {
			return true;
		}
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test('post', message, command) : null;
		if (reason != null) {
			this.emit(commandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
			return true;
		}
		return !!this.runCooldowns(message, command);
	}
}
