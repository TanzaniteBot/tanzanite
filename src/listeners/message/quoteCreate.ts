import { BotListener, mappings, type BotClientEvents } from '#lib';

export default class QuoteCreateListener extends BotListener {
	public constructor() {
		super('quoteCreate', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}

	public async exec(...[message]: BotClientEvents['messageCreate']) {
		if (message.author.id !== mappings.users['IRONM00N'] || !this.client.config.isProduction) return;
		if (!message.inGuild()) return;

		const messages = await this.client.utils.resolveMessagesFromLinks(message.content);
		if (!messages.length) return;

		for (const msg of messages) {
			await message.guild.quote(msg, message.channel);
		}
	}
}
