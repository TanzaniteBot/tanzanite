import { BotListener } from '../../classes/BotListener';
export default class ReadyListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client',
		});
	}

	public exec(): void {
		console.log(`Logged in to ${this.client.user.tag}`);
		console.log('-----------------------------------------------------------------------------');
		this.client.user.setPresence({
			activity: {
				name: `My prefix is ${this.client.config.prefix} or just mention me`,
				type: 'PLAYING',
			},
			status: 'online',
		});
	}
}
