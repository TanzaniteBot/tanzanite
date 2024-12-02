import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class DjsDebugListener extends BotListener {
	public constructor() {
		super('djsDebug', {
			emitter: Emitter.Client,
			event: Events.Debug
		});
	}

	public exec(...[message]: BotClientEvents[Events.Debug]): void {
		void this.client.console.superVerbose('djsDebug', message);
	}
}
