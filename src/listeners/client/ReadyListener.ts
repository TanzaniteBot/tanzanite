import chalk from 'chalk';
import { BotListener } from '../../extensions/BotListener';
export default class ReadyListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	public exec(): void {
		console.log(chalk.red(`Logged in to ${this.client.user.tag}`));
		console.log(chalk.blue('-----------------------------------------------------------------------------'));
		this.client.user.setPresence({
			activity: {
				name: 'with Moulberry',
				type: 'COMPETING'
				//url: 'https://discord.gg/moulberry',
			},
			status: 'online'
		});

		//setInterval(, 60000)
	}
}
