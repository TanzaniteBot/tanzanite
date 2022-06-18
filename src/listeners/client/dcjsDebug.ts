import { BushListener, type BushClientEvents } from '#lib';

export default class DiscordJsDebugListener extends BushListener {
	public constructor() {
		super('discordJsDebug', {
			emitter: 'client',
			event: 'debug',
			category: 'client'
		});
	}

	public async exec(...[message]: BushClientEvents['debug']): Promise<void> {
		void this.client.console.superVerbose('dc.js-debug', message);
	}
}
