import { BotListener, type BotClientEvents } from '#lib';

export default class DiscordJsDebugListener extends BotListener {
	public constructor() {
		super('discordJsDebug', {
			emitter: 'client',
			event: 'debug'
		});
	}

	public async exec(...[message]: BotClientEvents['debug']): Promise<void> {
		void this.client.console.superVerbose('dc.js-debug', message);
	}
}
