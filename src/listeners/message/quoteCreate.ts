import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class QuoteCreateListener extends BotListener {
	public constructor() {
		super('quoteCreate', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (message.partial || message.author.partial || message.author.bot) return;
		if (!message.inGuild() || !(await message.guild.hasFeature('quoting'))) return;

		const messages = await this.client.utils.resolveMessagesFromLinks(message.content);
		if (!messages.length) return;

		for (const msg of messages) {
			await message.guild.quote(msg, message.channel, message.author);
		}
	}
}
