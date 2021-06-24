/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category, CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { Collection } from 'discord.js';
import { BushConstants } from '../utils/BushConstants';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';
import { BushMessage } from './BushMessage';

export type BushCommandHandlerOptions = CommandHandlerOptions;

const CommandHandlerEvents = BushConstants.CommandHandlerEvents;
const BlockedReasons = BushConstants.BlockedReasons;

export class BushCommandHandler extends CommandHandler {
	public declare client: BushClient;
	public declare modules: Collection<string, BushCommand>;
	public declare categories: Collection<string, Category<string, BushCommand>>;
	public constructor(client: BushClient, options: CommandHandlerOptions) {
		super(client, options);
		this.client = client;
	}

	public async runPostTypeInhibitors(message: BushMessage, command: BushCommand, slash = false): Promise<boolean> {
		if (command.ownerOnly) {
			const isOwner = this.client.isOwner(message.author);
			if (!isOwner) {
				this.emit(
					slash ? CommandHandlerEvents.SLASH_BLOCKED : CommandHandlerEvents.COMMAND_BLOCKED,
					message,
					command,
					BlockedReasons.OWNER
				);
				return true;
			}
		}

		if (command.superUserOnly) {
			const isSuperUser = this.client.isSuperUser(message.author);
			if (!isSuperUser) {
				this.emit(
					slash ? CommandHandlerEvents.SLASH_BLOCKED : CommandHandlerEvents.COMMAND_BLOCKED,
					message,
					command,
					BlockedReasons.OWNER
				);
				return true;
			}
		}

		if (command.channel === 'guild' && !message.guild) {
			this.emit(
				slash ? CommandHandlerEvents.SLASH_BLOCKED : CommandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				BlockedReasons.GUILD
			);
			return true;
		}

		if (command.channel === 'dm' && message.guild) {
			this.emit(
				slash ? CommandHandlerEvents.SLASH_BLOCKED : CommandHandlerEvents.COMMAND_BLOCKED,
				message,
				command,
				BlockedReasons.DM
			);
			return true;
		}
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BlockedReasons.RESTRICTED_CHANNEL);
				return true;
			}
		}
		if (command.restrictedGuilds?.length && message.guild) {
			if (!command.restrictedGuilds.includes(message.guild.id)) {
				this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, BlockedReasons.RESTRICTED_GUILD);
				return true;
			}
		}
		if (await this.runPermissionChecks(message, command)) {
			return true;
		}
		const reason = this.inhibitorHandler ? await this.inhibitorHandler.test('post', message, command) : null;
		if (reason != null) {
			this.emit(CommandHandlerEvents.COMMAND_BLOCKED, message, command, reason);
			return true;
		}
		return !!this.runCooldowns(message, command);
	}
}
