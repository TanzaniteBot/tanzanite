import { BotListener, type BotClientEvents } from '#lib';

export default class DiscordJsWarnListener extends BotListener {
	public constructor() {
		super('discordJsWarn', {
			emitter: 'client',
			event: 'warn'
		});
	}

	public async exec(...[message]: BotClientEvents['warn']): Promise<void> {
		void this.client.console.superVerbose('dc.js-warn', message);
	}
}
