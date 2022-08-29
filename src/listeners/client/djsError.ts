import { BotListener, type BotClientEvents } from '#lib';

export default class DiscordJsErrorListener extends BotListener {
	public constructor() {
		super('discordJsError', {
			emitter: 'client',
			event: 'error'
		});
	}

	public async exec(...[error]: BotClientEvents['error']): Promise<void> {
		void this.client.console.superVerbose('dc.js-error', error);
	}
}
