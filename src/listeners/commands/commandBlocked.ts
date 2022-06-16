import {
	BlockedReasons,
	BushListener,
	emojis,
	format,
	oxford,
	type BushCommand,
	type BushCommandHandlerEvents,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { type InteractionReplyOptions, type MessagePayload, type ReplyMessageOptions } from 'discord.js';

export default class CommandBlockedListener extends BushListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
			category: 'commands'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['commandBlocked']) {
		return await CommandBlockedListener.handleBlocked(message, command, reason);
	}

	public static async handleBlocked(message: CommandMessage | SlashMessage, command: BushCommand | null, reason?: string) {
		const isSlash = !!command && !!message.util?.isSlash;

		void client.console.info(
			`${isSlash ? 'SlashC' : 'c'}ommandBlocked`,
			`<<${message.author.tag}>>${
				command ? ` tried to run <<${command}>> but` : "'s message"
			} was blocked because <<${reason}>>.`,
			true
		);

		switch (reason) {
			case BlockedReasons.OWNER: {
				return await respond({
					content: `${emojis.error} Only my developers can run the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case BlockedReasons.SUPER_USER: {
				return await respond({
					content: `${emojis.error} You must be a superuser to run the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case BlockedReasons.DISABLED_GLOBAL: {
				return await respond({
					content: `${emojis.error} My developers disabled the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case BlockedReasons.DISABLED_GUILD: {
				return await respond({
					content: `${emojis.error} The ${format.input(command!.id)} command is currently disabled in ${format.input(
						message.guild!.name
					)}.`,
					ephemeral: true
				});
			}
			case BlockedReasons.CHANNEL_GLOBAL_BLACKLIST:
			case BlockedReasons.CHANNEL_GUILD_BLACKLIST:
				return isSlash
					? await respond({
							content: `${emojis.error} You cannot use this bot in this channel.`,
							ephemeral: true
					  })
					: await (message as CommandMessage).react(emojis.cross);
			case BlockedReasons.USER_GLOBAL_BLACKLIST:
			case BlockedReasons.USER_GUILD_BLACKLIST:
				return isSlash
					? await respond({
							content: `${emojis.error} You are blacklisted from using this bot.`,
							ephemeral: true
					  })
					: await (message as CommandMessage).react(emojis.cross);
			case BlockedReasons.ROLE_BLACKLIST: {
				return isSlash
					? await respond({
							content: `${emojis.error} One of your roles blacklists you from using this bot.`,
							ephemeral: true
					  })
					: await (message as CommandMessage).react(emojis.cross);
			}
			case BlockedReasons.RESTRICTED_CHANNEL: {
				if (!command) break;
				const channels = command.restrictedChannels;
				const names: string[] = [];
				channels!.forEach((c) => {
					names.push(`<#${c}>`);
				});
				const pretty = oxford(names, 'and');
				return await respond({
					content: `${emojis.error} ${format.input(command!.id)} can only be run in ${pretty}.`,
					ephemeral: true
				});
			}
			case BlockedReasons.RESTRICTED_GUILD: {
				if (!command) break;
				const guilds = command.restrictedGuilds;
				const names = guilds!.map((g) => format.input(client.guilds.cache.get(g)?.name ?? g));
				const pretty = oxford(names, 'and');
				return await respond({
					content: `${emojis.error} ${format.input(command!.id)} can only be run in ${pretty}.`,
					ephemeral: true
				});
			}
			default: {
				return await respond({
					content: `${emojis.error} Command blocked with reason ${format.input(reason ?? 'unknown')}.`,
					ephemeral: true
				});
			}
		}

		// some inhibitors do not have message.util yet
		function respond(content: string | MessagePayload | ReplyMessageOptions | InteractionReplyOptions) {
			return message.util
				? message.util.reply(<string | MessagePayload | ReplyMessageOptions>content)
				: message.reply(<string | MessagePayload | (ReplyMessageOptions & InteractionReplyOptions)>content);
		}
	}
}
