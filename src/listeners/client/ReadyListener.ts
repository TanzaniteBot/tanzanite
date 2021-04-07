import chalk from 'chalk';
import functions from '../../constants/functions';
import { BushListener } from '../../lib/extensions/BushListener';
export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		});
	}

	public exec(): void {
		console.log(
			`${chalk.bgGreen(functions.timeStamp())} Logged in to ${chalk.magenta(this.client.user.tag)} serving ${chalk.magenta(this.client.guilds.cache.size)} guilds.`
		);
		console.log(chalk.blue('-----------------------------------------------------------------------------'));
		this.client.user.setPresence({
			activity: {
				name: 'with Moulberry',
				type: 'COMPETING'
				//url: 'https://discord.gg/moulberry',
			},
			status: 'online'
		});
	}
}
