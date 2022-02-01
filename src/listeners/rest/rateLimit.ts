import { BushListener } from '#lib';
import { RestEvents } from '@discordjs/rest';

export default class RateLimitedListener extends BushListener {
	public constructor() {
		super('rateLimited', {
			emitter: 'rest',
			event: 'rateLimited',
			category: 'rest'
		});
	}

	public override async exec(...[message]: RestEvents['rateLimited']): Promise<void> {
		void client.console.superVerboseRaw('rateLimited', message);
	}
}
