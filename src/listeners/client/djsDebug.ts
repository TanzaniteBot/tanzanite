import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class DjsDebugListener extends BotListener {
	public constructor() {
		super('djsDebug', {
			emitter: Emitter.Client,
			event: Events.Debug
		});
	}

	public async exec(...[message]: BotClientEvents[Events.Debug]): Promise<void> {
		void this.client.console.superVerbose('dc.js-debug', message);
	}
}
