import { BotInhibitor, InhibitorReason, InhibitorType, type SlashMessage } from '#lib';
import type { Message } from 'discord.js';

export default class FatalInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.Fatal, {
			reason: InhibitorReason.Fatal,
			type: InhibitorType.All,
			priority: 100
		});
	}

	public exec(message: Message | SlashMessage): boolean {
		if (this.client.isOwner(message.author)) return false;
		const globalCache = this.client.cache.global;
		for (const property in globalCache) {
			if (globalCache[property as keyof typeof globalCache] == null) {
				void this.client.console.verbose(
					InhibitorReason.Fatal,
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
