import { BushListener, type BushClientEvents } from '#lib';

export default class RateLimitListener extends BushListener {
	public constructor() {
		super('rateLimit', {
			emitter: 'client',
			event: 'rateLimit',
			category: 'client'
		});
	}

	public override async exec(...[message]: BushClientEvents['rateLimit']): Promise<void> {
		void client.console.superVerboseRaw('rateLimit', message);
	}
}
