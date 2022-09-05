import { BotListener, Emitter, MessageAutomod, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class AutomodMessageUpdateListener extends BotListener {
	public constructor() {
		super('automodUpdate', {
			emitter: Emitter.Client,
			event: Events.MessageUpdate
		});
	}

	public async exec(...[_, newMessage]: BotClientEvents[Events.MessageUpdate]) {
		const fullMessage = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
		if (!fullMessage?.member) return;
		return new MessageAutomod(fullMessage);
	}
}
