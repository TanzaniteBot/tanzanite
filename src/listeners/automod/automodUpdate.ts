import { BushListener, MessageAutomod, type BushClientEvents } from '#lib';

export default class AutomodMessageUpdateListener extends BushListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'message'
		});
	}

	public async exec(...[_, newMessage]: BushClientEvents['messageUpdate']) {
		const fullMessage = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
		if (!fullMessage?.member) return;
		return new MessageAutomod(fullMessage);
	}
}
