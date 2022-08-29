import { BotListener, type BotClientEvents } from '#lib';

export default class DiscordJsDebugListener extends BotListener {
	public constructor() {
		super('akairoDebug', {
			emitter: 'client',
			event: 'akairoDebug'
		});
	}

	public async exec(...[message, ...other]: BotClientEvents['debug']): Promise<void> {
		if (other.length && !message.includes('[registerInteractionCommands]'))
			void this.client.console.superVerboseRaw('akairoDebug', message, ...other);
		else void this.client.console.superVerbose('akairoDebug', message);
	}
}
