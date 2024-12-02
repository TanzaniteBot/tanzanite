import { BotInhibitor, InhibitorReason, InhibitorType, type SlashMessage } from '#lib';
import type { Message } from 'discord.js';

export default class GuildUnavailableInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.GuildUnavailable, {
			reason: InhibitorReason.GuildUnavailable,
			type: InhibitorType.All,
			priority: 70
		});
	}

	public exec(message: Message | SlashMessage): boolean {
		if (message.inGuild() && !message.guild.available) {
			void this.client.console.verbose(
				InhibitorReason.GuildUnavailable,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
