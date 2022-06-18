import { BushListener } from '#lib';
import type { RestEvents } from '@discordjs/rest';

export default class RateLimitedListener extends BushListener {
	public constructor() {
		super('rateLimited', {
			emitter: 'rest',
			event: 'rateLimited',
			category: 'rest'
		});
	}

	public async exec(...[message]: RestEvents['rateLimited']): Promise<void> {
		void this.client.console.superVerboseRaw('rateLimited', message);
	}
}
