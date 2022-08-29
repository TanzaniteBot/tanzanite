import { type BotCommand, type CommandMessage, type SlashMessage } from '#lib';
import { CommandHandler, type Category, type CommandHandlerEvents, type CommandHandlerOptions } from 'discord-akairo';
import { type Collection, type Message, type PermissionsString } from 'discord.js';

export type CustomCommandHandlerOptions = CommandHandlerOptions;

export interface BotCommandHandlerEvents extends CommandHandlerEvents {
	commandBlocked: [message: CommandMessage, command: BotCommand, reason: string];
	commandBreakout: [message: CommandMessage, command: BotCommand, /* no util */ breakMessage: Message];
	commandCancelled: [message: CommandMessage, command: BotCommand, /* no util */ retryMessage?: Message];
	commandFinished: [message: CommandMessage, command: BotCommand, args: any, returnValue: any];
	commandInvalid: [message: CommandMessage, command: BotCommand];
	commandLocked: [message: CommandMessage, command: BotCommand];
	commandStarted: [message: CommandMessage, command: BotCommand, args: any];
	cooldown: [message: CommandMessage | SlashMessage, command: BotCommand, remaining: number];
	error: [error: Error, message: /* no util */ Message, command?: BotCommand];
	inPrompt: [message: /* no util */ Message];
	load: [command: BotCommand, isReload: boolean];
	messageBlocked: [message: /* no util */ Message | CommandMessage | SlashMessage, reason: string];
	messageInvalid: [message: CommandMessage];
	missingPermissions: [message: CommandMessage, command: BotCommand, type: 'client' | 'user', missing: PermissionsString[]];
	remove: [command: BotCommand];
	slashBlocked: [message: SlashMessage, command: BotCommand, reason: string];
	slashError: [error: Error, message: SlashMessage, command: BotCommand];
	slashFinished: [message: SlashMessage, command: BotCommand, args: any, returnValue: any];
	slashMissingPermissions: [message: SlashMessage, command: BotCommand, type: 'client' | 'user', missing: PermissionsString[]];
	slashStarted: [message: SlashMessage, command: BotCommand, args: any];
}

export class BotCommandHandler extends CommandHandler {
	public declare modules: Collection<string, BotCommand>;
	public declare categories: Collection<string, Category<string, BotCommand>>;
}

export interface BotCommandHandler extends CommandHandler {
	findCommand(name: string): BotCommand;
}
