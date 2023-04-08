import { BotListener, Emitter } from '#lib';
import { RESTEvents, type RestEvents } from '@discordjs/rest';

export default class RateLimitedListener extends BotListener {
	public constructor() {
		super('rateLimited', {
			emitter: Emitter.Rest,
			event: RESTEvents.RateLimited
		});
	}

	public async exec(...[message]: RestEvents[RESTEvents.RateLimited]): Promise<void> {
		void this.client.console.superVerboseRaw('rateLimited', message);
	}
}
