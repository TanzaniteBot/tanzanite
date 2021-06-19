import chalk from 'chalk';
import { BushListener } from '../../lib/extensions/BushListener';

export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public async exec(): Promise<void> {
		//@ts-expect-error: ik its private, this is the only time I need to access it outside of its class
		const timeStamp = chalk.bgGreen(this.client.logger.getTimeStamp()),
			tag = chalk.magenta(this.client.user.tag),
			guildCount = chalk.magenta(this.client.guilds.cache.size.toLocaleString()),
			userCount = chalk.magenta(this.client.users.cache.size.toLocaleString());

		console.log(`${timeStamp} Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);
		console.log(
			chalk.blue(`----------------------------------------------------------------------${this.client.config.dev ? '---' : ''}`)
		);

		this.client.user.setPresence({
			activities: [
				{
					name: 'Beep Boop',
					type: 'WATCHING'
				}
			],
			status: 'online'
		});
	}
}
