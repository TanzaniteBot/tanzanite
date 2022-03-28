import { BushListener, type BushClientEvents } from '#lib';

export default class QuoteCreateListener extends BushListener {
	public constructor() {
		super('quoteCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (message.author.id !== '322862723090219008' || !client.config.isProduction) return;
		if (!message.inGuild()) return;

		const messages = await util.resolveMessagesFromLinks(message.content);
		if (!messages.length) return;

		for (const msg of messages) {
			await message.guild.quote(msg, message.channel);
		}
	}
}
