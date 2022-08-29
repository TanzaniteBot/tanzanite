import { BotInhibitor, type SlashMessage } from '#lib';
import { type Message } from 'discord.js';

export default class FatalInhibitor extends BotInhibitor {
	public constructor() {
		super('fatal', {
			reason: 'fatal',
			type: 'all',
			priority: 100
		});
	}

	public async exec(message: Message | SlashMessage): Promise<boolean> {
		if (this.client.isOwner(message.author)) return false;
		const globalCache = this.client.cache.global;
		for (const property in globalCache) {
			if (!globalCache[property as keyof typeof globalCache]) {
				void this.client.console.verbose(
					'fatal',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
