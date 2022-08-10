import { BushListener, mappings, type BushClientEvents } from '#lib';

export default class QuoteCreateListener extends BushListener {
	public constructor() {
		super('quoteCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']) {
		if (message.author.id !== mappings.users['IRONM00N'] || !this.client.config.isProduction) return;
		if (!message.inGuild()) return;

		const messages = await this.client.utils.resolveMessagesFromLinks(message.content);
		if (!messages.length) return;

		for (const msg of messages) {
			await message.guild.quote(msg, message.channel);
		}
	}
}
