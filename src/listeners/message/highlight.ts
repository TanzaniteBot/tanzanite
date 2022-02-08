import { BushListener, type BushClientEvents } from '#lib';

export default class HighlightListener extends BushListener {
	public constructor() {
		super('highlight', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (!message.inGuild()) return;
	}
}
