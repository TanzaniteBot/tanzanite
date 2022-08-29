import { BotListener, MessageAutomod, type BotClientEvents } from '#lib';

export default class AutomodMessageUpdateListener extends BotListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate'
		});
	}

	public async exec(...[_, newMessage]: BotClientEvents['messageUpdate']) {
		const fullMessage = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
		if (!fullMessage?.member) return;
		return new MessageAutomod(fullMessage);
	}
}
