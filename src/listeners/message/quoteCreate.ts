import { BotListener, Emitter, mappings, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class QuoteCreateListener extends BotListener {
	public constructor() {
		super('quoteCreate', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (message.author.id !== mappings.users['IRONM00N'] /*  || !this.client.config.isProduction */) return;
		if (!message.inGuild()) return;

		const messages = await this.client.utils.resolveMessagesFromLinks(message.content);
		if (!messages.length) return;

		for (const msg of messages) {
			await message.guild.quote(msg, message.channel);
		}
	}
}
