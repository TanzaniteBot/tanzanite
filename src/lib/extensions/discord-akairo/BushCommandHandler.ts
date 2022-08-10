import { type BushCommand, type CommandMessage, type SlashMessage } from '#lib';
import { CommandHandler, type Category, type CommandHandlerEvents, type CommandHandlerOptions } from 'discord-akairo';
import { type Collection, type Message, type PermissionsString } from 'discord.js';

export type BushCommandHandlerOptions = CommandHandlerOptions;

export interface BushCommandHandlerEvents extends CommandHandlerEvents {
	commandBlocked: [message: CommandMessage, command: BushCommand, reason: string];
	commandBreakout: [message: CommandMessage, command: BushCommand, /* no util */ breakMessage: Message];
	commandCancelled: [message: CommandMessage, command: BushCommand, /* no util */ retryMessage?: Message];
	commandFinished: [message: CommandMessage, command: BushCommand, args: any, returnValue: any];
	commandInvalid: [message: CommandMessage, command: BushCommand];
	commandLocked: [message: CommandMessage, command: BushCommand];
	commandStarted: [message: CommandMessage, command: BushCommand, args: any];
	cooldown: [message: CommandMessage | SlashMessage, command: BushCommand, remaining: number];
	error: [error: Error, message: /* no util */ Message, command?: BushCommand];
	inPrompt: [message: /* no util */ Message];
	load: [command: BushCommand, isReload: boolean];
	messageBlocked: [message: /* no util */ Message | CommandMessage | SlashMessage, reason: string];
	messageInvalid: [message: CommandMessage];
	missingPermissions: [message: CommandMessage, command: BushCommand, type: 'client' | 'user', missing: PermissionsString[]];
	remove: [command: BushCommand];
	slashBlocked: [message: SlashMessage, command: BushCommand, reason: string];
	slashError: [error: Error, message: SlashMessage, command: BushCommand];
	slashFinished: [message: SlashMessage, command: BushCommand, args: any, returnValue: any];
	slashMissingPermissions: [message: SlashMessage, command: BushCommand, type: 'client' | 'user', missing: PermissionsString[]];
	slashStarted: [message: SlashMessage, command: BushCommand, args: any];
}

export class BushCommandHandler extends CommandHandler {
	public declare modules: Collection<string, BushCommand>;
	public declare categories: Collection<string, Category<string, BushCommand>>;
}

export interface BushCommandHandler extends CommandHandler {
	findCommand(name: string): BushCommand;
}
