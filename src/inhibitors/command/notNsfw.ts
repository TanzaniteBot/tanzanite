import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';
import type { TextChannel } from 'discord.js';

export default class NotNsfwInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.NotNsfw, {
			reason: InhibitorReason.NotNsfw,
			type: InhibitorType.Post,
			priority: 25
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (command.onlyNsfw && !(message.channel as TextChannel).nsfw) {
			void this.client.console.verbose(
				InhibitorReason.NotNsfw,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
			);
			return true;
		}
		return false;
	}
}
