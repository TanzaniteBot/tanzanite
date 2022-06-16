import { BushListener, type BushClientEvents } from '#lib';

export default class DiscordJsErrorListener extends BushListener {
	public constructor() {
		super('discordJsError', {
			emitter: 'client',
			event: 'error',
			category: 'client'
		});
	}

	public async exec(...[error]: BushClientEvents['error']): Promise<void> {
		void client.console.superVerbose('dc.js-error', error);
	}
}
