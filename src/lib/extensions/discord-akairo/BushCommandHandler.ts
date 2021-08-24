import { Category, CommandHandler, CommandHandlerEvents, CommandHandlerOptions } from 'discord-akairo';
import { Collection, PermissionString } from 'discord.js';
import { BushConstants } from '../../utils/BushConstants';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushSlashMessage } from './BushSlashMessage';

export type BushCommandHandlerOptions = CommandHandlerOptions;

const commandHandlerEvents = BushConstants.CommandHandlerEvents;

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

	public override async runPostTypeInhibitors(message: BushMessage, command: BushCommand, slash = false): Promise<boolean> {
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test('post', message, command) : null;
		if (reason != null) {
			this.emit(slash ? commandHandlerEvents.SLASH_BLOCKED : commandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
			return true;
		}

		if (await this.runPermissionChecks(message, command)) {
			return true;
		}

		return !!this.runCooldowns(message, command);
	}
}
