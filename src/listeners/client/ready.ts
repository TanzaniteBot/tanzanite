import chalk from 'chalk';
import { BotListener } from '../../lib/extensions/BotListener';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public async exec(): Promise<void> {
		await this.client.logger.log(
			chalk`{green Sucessfully logged in as {cyan ${this.client.user.tag}}.}`,
			true
		);
	}
}
