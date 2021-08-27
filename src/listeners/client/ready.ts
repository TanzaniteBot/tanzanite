import { BushListener } from '@lib';
import chalk from 'chalk';

export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			type: 'once'
		});
	}

	public override async exec(): Promise<void> {
		const tag = `<<${client.user?.tag}>>`,
			guildCount = `<<${client.guilds.cache.size.toLocaleString()}>>`,
			userCount = `<<${client.users.cache.size.toLocaleString()}>>`;

		void client.logger.success('ready', `Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);
		console.log(
			chalk.blue(
				`------------------------------------------------------------------------------${
					client.config.isDevelopment ? '---' : client.config.isBeta ? '----' : ''
				}`
			)
		);
	}
}
