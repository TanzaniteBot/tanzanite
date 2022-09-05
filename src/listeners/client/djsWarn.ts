import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class DjsWarnListener extends BotListener {
	public constructor() {
		super('djsWarn', {
			emitter: Emitter.Client,
			event: Events.Warn
		});
	}

	public async exec(...[message]: BotClientEvents[Events.Warn]): Promise<void> {
		void this.client.console.superVerbose('dc.js-warn', message);
	}
}
