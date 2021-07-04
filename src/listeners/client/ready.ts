import chalk from 'chalk';
import { BushListener } from '../../lib';

export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public async exec(): Promise<void> {
		const tag = `<<${this.client.user.tag}>>`,
			guildCount = `<<${this.client.guilds.cache.size.toLocaleString()}>>`,
			userCount = `<<${this.client.users.cache.size.toLocaleString()}>>`;

		this.client.logger.success('Ready', `Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);
		console.log(
			chalk.blue(
				`------------------------------------------------------------------------------${this.client.config.dev ? '---' : ''}`
			)
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
