import { AutoMod, BushClientEvents, BushListener } from '@lib';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']): Promise<unknown> {
		return new AutoMod(message);
	}
}
