import { Category, CommandHandler, CommandHandlerEvents, CommandHandlerOptions } from 'discord-akairo';
import { Collection, PermissionString } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushSlashMessage } from './BushSlashMessage';

export type BushCommandHandlerOptions = CommandHandlerOptions;

export interface BushCommandHandlerEvents extends CommandHandlerEvents {
	commandBlocked: [message: BushMessage, command: BushCommand, reason: string];
	commandBreakout: [message: BushMessage, command: BushCommand, breakMessage: BushMessage];
	commandCancelled: [message: BushMessage, command: BushCommand, retryMessage?: BushMessage];
	commandFinished: [message: BushMessage, command: BushCommand, args: any, returnValue: any];
	commandInvalid: [message: BushMessage, command: BushCommand];
	commandLocked: [message: BushMessage, command: BushCommand];
	commandStarted: [message: BushMessage, command: BushCommand, args: any];
	cooldown: [message: BushMessage | BushSlashMessage, command: BushCommand, remaining: number];
	error: [error: Error, message: BushMessage, command?: BushCommand];
	inPrompt: [message: BushMessage];
	load: [command: BushCommand, isReload: boolean];
	messageBlocked: [message: BushMessage | BushSlashMessage, reason: string];
	messageInvalid: [message: BushMessage];
	missingPermissions: [message: BushMessage, command: BushCommand, type: 'client' | 'user', missing: Array<PermissionString>];
	remove: [command: BushCommand];
	slashBlocked: [message: BushSlashMessage, command: BushCommand, reason: string];
	slashError: [error: Error, message: BushSlashMessage, command: BushCommand];
	slashFinished: [message: BushSlashMessage, command: BushCommand, args: any, returnValue: any];
	slashMissingPermissions: [
		message: BushSlashMessage,
		command: BushCommand,
		type: 'client' | 'user',
		missing: Array<PermissionString>
	];
	slashStarted: [message: BushSlashMessage, command: BushCommand, args: any];
}

export class BushCommandHandler extends CommandHandler {
	public declare client: BushClient;
	public declare modules: Collection<string, BushCommand>;
	public declare categories: Collection<string, Category<string, BushCommand>>;
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
	}
}
