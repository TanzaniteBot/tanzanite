import type { BotCommand, CommandMessage, SlashMessage, TanzaniteClient } from '#lib';
import {
	CommandHandler,
	type Category,
	type CommandHandlerEvents,
	type CommandHandlerOptions,
	type TextCommandMessage
} from '@tanzanite/discord-akairo';
import type { Collection, GuildMember, PermissionResolvable, PermissionsString } from 'discord.js';
import { CommandHandlerEvent } from '../../utils/Constants.js';

export type CustomCommandHandlerOptions = CommandHandlerOptions;

export interface BotCommandHandlerEvents extends CommandHandlerEvents {
	commandBlocked: [message: CommandMessage, command: BotCommand, reason: string];
	commandBreakout: [message: CommandMessage, command: BotCommand, /* no util */ breakMessage: TextCommandMessage];
	commandCancelled: [message: CommandMessage, command: BotCommand, /* no util */ retryMessage?: TextCommandMessage];
	commandFinished: [message: CommandMessage, command: BotCommand, args: any, returnValue: any];
	commandInvalid: [message: CommandMessage, command: BotCommand];
	commandLocked: [message: CommandMessage, command: BotCommand];
	commandStarted: [message: CommandMessage, command: BotCommand, args: any];
	cooldown: [message: CommandMessage | SlashMessage, command: BotCommand, remaining: number];
	error: [error: Error, /* no util */ message: TextCommandMessage, command?: BotCommand];
	inPrompt: [/* no util */ message: TextCommandMessage];
	load: [command: BotCommand, isReload: boolean];
	messageBlocked: [/* no util */ message: TextCommandMessage | CommandMessage | SlashMessage, reason: string];
	messageInvalid: [message: CommandMessage];
	missingPermissions: [
		message: CommandMessage,
		command: BotCommand,
		type: 'client' | 'user',
		// fix: this is jank
		missing: (PermissionsString | '[[UnsupportedChannel]]')[]
	];
	remove: [command: BotCommand];
	slashBlocked: [message: SlashMessage, command: BotCommand, reason: string];
	slashError: [error: Error, message: SlashMessage, command: BotCommand];
	slashFinished: [message: SlashMessage, command: BotCommand, args: any, returnValue: any];
	slashMissingPermissions: [
		message: SlashMessage,
		command: BotCommand,
		type: 'client' | 'user',
		// fix: this is jank
		missing: (PermissionsString | '[[UnsupportedChannel]]')[]
	];
	slashStarted: [message: SlashMessage, command: BotCommand, args: any];
}

export class BotCommandHandler extends CommandHandler {
	declare public readonly client: TanzaniteClient;

	declare public modules: Collection<string, BotCommand>;
	declare public categories: Collection<string, Category<string, BotCommand>>;

	//! this is a simplified version of the original
	// eslint-disable-next-line @typescript-eslint/require-await
	public override async runPermissionChecks(
		message: TextCommandMessage | SlashMessage,
		command: BotCommand,
		slash: boolean = false
	): Promise<boolean> {
		const event = slash ? CommandHandlerEvent.SlashMissingPermissions : CommandHandlerEvent.MissingPermissions;

		const appSlashPerms = slash ? (message as SlashMessage).interaction.appPermissions : null;
		const userSlashPerms = slash ? (message as SlashMessage).interaction.memberPermissions : null;

		const noPerms = message.channel == null || (message.channel.isThread() && message.channel.parent == null);

		if (message.inGuild()) {
			if (noPerms && command.clientCheckChannel && appSlashPerms == null) {
				this.emit(event, <SlashMessage>message, command, 'client', ['[[UnsupportedChannel]]']);
				return true;
			}
			if (message.channel?.isDMBased()) return false;

			const missing = command.clientCheckChannel
				? (appSlashPerms ?? message.channel?.permissionsFor(message.guild.members.me!))?.missing(command.clientPermissions)
				: message.guild?.members.me?.permissions.missing(command.clientPermissions);

			if (missing?.length) {
				this.emit(event, <SlashMessage>message, command, 'client', missing);
				return true;
			}
		}

		if (command.userPermissions) {
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			const ignorer = command.ignorePermissions || this.ignorePermissions;
			const isIgnored = Array.isArray(ignorer)
				? ignorer.includes(message.author.id)
				: typeof ignorer === 'function'
					? ignorer(message, command)
					: message.author.id === ignorer;

			if (!isIgnored) {
				if (message.inGuild()) {
					if (noPerms && command.userCheckChannel && userSlashPerms == null) {
						this.emit(event, <SlashMessage>message, command, 'user', ['[[UnsupportedChannel]]']);
						return true;
					}
					if (message.channel?.isDMBased()) return false;

					const missing = command.userCheckChannel
						? (userSlashPerms ?? message.channel?.permissionsFor(message.author))?.missing(command.userPermissions)
						: message.member?.permissions.missing(command.userPermissions);

					if (missing?.length) {
						this.emit(event, <SlashMessage>message, command, 'user', missing);
						return true;
					}
				}
			}
		}

		return false;
	}
}

export interface BotCommandHandler extends CommandHandler {
	findCommand(name: string): BotCommand;
}

export function permissionCheck(
	message: CommandMessage | SlashMessage,
	check: GuildMember,
	perms: PermissionResolvable,
	useChannel: boolean
): boolean {
	if (message.inGuild()) {
		if (!message.channel || message.channel.isDMBased()) return true;

		const missing = useChannel ? message.channel.permissionsFor(check)?.missing(perms) : check.permissions.missing(perms);

		if (missing?.length) return false;
	}
	return true;
}
