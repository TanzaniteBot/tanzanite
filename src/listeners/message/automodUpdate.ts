import { AutoMod, BushListener, type BushClientEvents } from '#lib';

export default class AutomodMessageUpdateListener extends BushListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'message'
		});
	}

	public override async exec(...[_, newMessage]: BushClientEvents['messageUpdate']) {
		const fullMessage = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
		if (!fullMessage) return;
		return new AutoMod(fullMessage);
	}
}
