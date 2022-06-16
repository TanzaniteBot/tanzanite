import { BushInhibitor, type SlashMessage } from '#lib';
import { type Message } from 'discord.js';

export default class GuildUnavailableInhibitor extends BushInhibitor {
	public constructor() {
		super('guildUnavailable', {
			reason: 'guildUnavailable',
			type: 'all',
			category: 'checks',
			priority: 70
		});
	}

	public async exec(message: Message | SlashMessage): Promise<boolean> {
		if (message.inGuild() && !message.guild.available) {
			void client.console.verbose(
				'guildUnavailable',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
