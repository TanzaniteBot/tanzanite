import {
	BotListener,
	CommandHandlerEvent,
	Emitter,
	InhibitorReason,
	emojis,
	format,
	formatList,
	type BotCommandHandlerEvents,
	type CommandMessage
} from '#lib';
import { AkairoMessage } from '@tanzanite/discord-akairo';
import {
	MessageFlags,
	MessageFlagsBitField,
	type BitFieldResolvable,
	type Client,
	type InteractionReplyOptions,
	type MessageFlagsString,
	type MessageReplyOptions
} from 'discord.js';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('commandBlocked', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.CommandBlocked
		});
	}

	public async exec(...[message, command, reason]: BotCommandHandlerEvents[CommandHandlerEvent.CommandBlocked]) {
		return await CommandBlockedListener.handleBlocked(this.client, message, command, reason);
	}

	public static async handleBlocked(
		client: Client,
		...[message, command, reason]: BotCommandHandlerEvents[CommandHandlerEvent.CommandBlocked | CommandHandlerEvent.SlashBlocked]
	) {
		const isSlash = Boolean(command) && Boolean(message.util?.isSlash);

		void client.console.info(
			`${isSlash ? 'SlashC' : 'c'}ommandBlocked`,
			`<<${message.author.tag}>>${
				command != null ? ` tried to run <<${command}>> but` : "'s message"
			} was blocked because <<${reason}>>.`,
			true
		);

		switch (reason) {
			case InhibitorReason.Owner: {
				return await respond({
					content: `${emojis.error} Only my developers can run the ${format.input(command.id)} command.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.SuperUser: {
				return await respond({
					content: `${emojis.error} You must be a superuser to run the ${format.input(command.id)} command.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.DisabledGlobal: {
				return await respond({
					content: `${emojis.error} My developers disabled the ${format.input(command.id)} command.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.DisabledGuild: {
				return await respond({
					content: `${emojis.error} The ${format.input(command.id)} command is currently disabled in ${format.input(
						message.guild!.name
					)}.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.ChannelGlobalBlacklist:
			case InhibitorReason.ChannelGuildBlacklist:
				return isSlash
					? await respond({
							content: `${emojis.error} You cannot use this bot in this channel.`,
							flags: MessageFlags.Ephemeral
						})
					: await (message as CommandMessage).react(emojis.cross);
			case InhibitorReason.UserGlobalBlacklist:
			case InhibitorReason.UserGuildBlacklist:
				return isSlash
					? await respond({
							content: `${emojis.error} You are blacklisted from using this bot.`,
							flags: MessageFlags.Ephemeral
						})
					: await (message as CommandMessage).react(emojis.cross);
			case InhibitorReason.RoleBlacklist: {
				return isSlash
					? await respond({
							content: `${emojis.error} One of your roles blacklists you from using this bot.`,
							flags: MessageFlags.Ephemeral
						})
					: await (message as CommandMessage).react(emojis.cross);
			}
			case InhibitorReason.RestrictedChannel: {
				if (command == null) break;
				const channels = command.restrictedChannels;
				const names: string[] = [];
				channels!.forEach((c) => {
					names.push(`<#${c}>`);
				});
				const pretty = formatList(names, 'and');
				return await respond({
					content: `${emojis.error} ${format.input(command.id)} can only be run in ${pretty}.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.RestrictedGuild: {
				if (command == null) break;
				const guilds = command.restrictedGuilds;
				const names = guilds!.map((g) => format.input(client.guilds.cache.get(g)?.name ?? g));
				const pretty = formatList(names, 'and');
				return await respond({
					content: `${emojis.error} ${format.input(command.id)} can only be run in ${pretty}.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case InhibitorReason.CannotSend:
			case InhibitorReason.Fatal:
				// don't send anything
				break;
			default: {
				return await respond({
					content: `${emojis.error} Command blocked with reason ${format.input(reason ?? 'unknown')}.`,
					flags: MessageFlags.Ephemeral
				});
			}
		}

		// some inhibitors do not have message.util yet
		function respond(content: string | (Omit<MessageReplyOptions & InteractionReplyOptions, 'flags'> & { flags: MessageFlags })) {
			if (!(message instanceof AkairoMessage) && typeof content !== 'string') {
				if (content.flags != null) {
					content.flags = new MessageFlagsBitField(content.flags as BitFieldResolvable<MessageFlagsString, number>).remove(
						MessageFlags.Ephemeral
					).bitfield;
				}
			}
			const cast = content as MessageReplyOptions & InteractionReplyOptions;
			return message.util != null ? message.util.reply(cast) : message.reply(cast);
		}
	}
}
