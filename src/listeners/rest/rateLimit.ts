import { BotListener } from '#lib';
import type { RestEvents } from '@discordjs/rest';

export default class RateLimitedListener extends BotListener {
	public constructor() {
		super('rateLimited', {
			emitter: 'rest',
			event: 'rateLimited'
		});
	}

	public async exec(...[message]: RestEvents['rateLimited']): Promise<void> {
		void this.client.console.superVerboseRaw('rateLimited', message);
	}
}
