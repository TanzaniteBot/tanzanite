import { BushListener, MessageAutomod, type BushClientEvents } from '#lib';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']) {
		if (message.member === null) return;
		return new MessageAutomod(message);
	}
}
