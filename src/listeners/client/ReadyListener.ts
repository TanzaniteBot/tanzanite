import { BotListener } from '../../lib/extensions/BotListener';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public async exec(): Promise<void> {
		await this.client.util.info(
			`Sucessfully logged in as ${this.client.user.tag}`
		);
	}
}
