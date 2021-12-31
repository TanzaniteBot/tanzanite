import { BushListener, type BushClientEvents } from '#lib';

export default class DiscordJsDebugListener extends BushListener {
	public constructor() {
		super('akairoDebug', {
			emitter: 'client',
			event: 'akairoDebug',
			category: 'client'
		});
	}

	public override async exec(...[message, ...other]: BushClientEvents['debug']): Promise<void> {
		if (other.length && !message.includes('[registerInteractionCommands]'))
			void client.console.superVerboseRaw('akairoDebug', message, ...other);
		else void client.console.superVerbose('akairoDebug', message);
	}
}
