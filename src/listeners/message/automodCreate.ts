import { AutoMod, BushListener, type BushClientEvents } from '#lib';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']) {
		return new AutoMod(message);
	}
}
