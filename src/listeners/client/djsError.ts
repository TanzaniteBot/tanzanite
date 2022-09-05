import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class DjsErrorListener extends BotListener {
	public constructor() {
		super('djsError', {
			emitter: Emitter.Client,
			event: Events.Error
		});
	}

	public async exec(...[error]: BotClientEvents[Events.Error]): Promise<void> {
		void this.client.console.superVerbose('dc.js-error', error);
	}
}
