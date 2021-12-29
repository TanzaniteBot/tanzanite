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
		void client.console.superVerboseRaw('akairoDebug', message, ...other);
	}
}
