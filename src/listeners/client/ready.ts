import { BushListener, Guild } from '#lib';
import chalk from 'chalk';

export default class ReadyListener extends BushListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			type: 'on'
		});
	}

	public override async exec() {
		client.taskHandler.startAll();
		process.emit('ready' as any);

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

		const guilds = await Guild.findAll();
		const needToCreate = [];
		for (const [, guild] of client.guilds.cache) {
			const find = guilds.find((g) => guild.id === g.id);
			if (!find) needToCreate.push(guild.id);
		}
		await Guild.bulkCreate(needToCreate.map((id) => ({ id })));
	}
}
