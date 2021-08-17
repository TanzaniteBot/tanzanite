import { BushListener } from '@lib';
import chalk from 'chalk';

export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	public override async exec(): Promise<void> {
		const tag = `<<${client.user?.tag}>>`,
			guildCount = `<<${client.guilds.cache.size.toLocaleString()}>>`,
			userCount = `<<${client.users.cache.size.toLocaleString()}>>`;

		void client.logger.success('Ready', `Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);
		console.log(
			chalk.blue(
				`------------------------------------------------------------------------------${
					client.config.isDevelopment ? '---' : client.config.isBeta ? '----' : ''
				}`
			)
		);

		setTimeout(
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			async () =>
				await client.application?.commands
					.create({ name: 'View Raw', type: 'MESSAGE' })
					.catch((e) => client.console.error(`Ready`, e?.stack ?? e)),
			2_000
		);
	}
}
