import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { AkairoClientEvent } from '@tanzanite/discord-akairo/dist/src/util/Constants.js';

export default class DiscordJsDebugListener extends BotListener {
	public constructor() {
		super('akairoDebug', {
			emitter: Emitter.Client,
			event: AkairoClientEvent.AKAIRO_DEBUG
		});
	}

	public async exec(...[message, ...other]: BotClientEvents['debug']): Promise<void> {
		if (other.length && !message.includes('[registerInteractionCommands]'))
			void this.client.console.superVerboseRaw('akairoDebug', message, ...other);
		else void this.client.console.superVerbose('akairoDebug', message);
	}
}
