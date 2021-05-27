import chalk from 'chalk';
import { BushListener } from '../../lib/extensions/BushListener';

export default class CommandBlockedListener extends BushListener {
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
