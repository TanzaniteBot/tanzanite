import { BotListener, MessageAutomod, type BotClientEvents } from '#lib';

export default class AutomodMessageCreateListener extends BotListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}

	public async exec(...[message]: BotClientEvents['messageCreate']) {
		if (message.member === null) return;
		return new MessageAutomod(message);
	}
}
