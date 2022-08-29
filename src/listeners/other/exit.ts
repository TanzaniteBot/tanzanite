import { BotListener } from '#lib';

export default class ExitListener extends BotListener {
	public constructor() {
		super('exit', {
			emitter: 'process',
			event: 'exit'
		});
	}

	public async exec(code: number) {
		await this.client.console.error('processExit', `Process ended with code <<${code}>>.`);
	}
}
