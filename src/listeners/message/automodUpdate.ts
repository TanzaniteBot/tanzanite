import { AutoMod, BushListener, type BushClientEvents, type BushMessage } from '@lib';

export default class AutomodMessageUpdateListener extends BushListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'message'
		});
	}

	public override async exec(...[_, newMessage]: BushClientEvents['messageUpdate']) {
		const fullMessage = newMessage.partial ? await newMessage.fetch() : (newMessage as BushMessage);
		return new AutoMod(fullMessage);
	}
}
