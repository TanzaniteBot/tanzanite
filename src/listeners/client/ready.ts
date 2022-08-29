import { BotClientEvents, BotListener, Guild } from '#lib';
import chalk from 'chalk';

export default class ReadyListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			type: 'on'
		});
	}

	// eslint-disable-next-line no-empty-pattern
	public async exec(...[]: BotClientEvents['ready']) {
		process.emit('ready' as any);

		const tag = `<<${this.client.user?.tag}>>`,
			guildCount = `<<${this.client.guilds.cache.size.toLocaleString()}>>`,
			userCount = `<<${this.client.users.cache.size.toLocaleString()}>>`;

		void this.client.logger.success('ready', `Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);
		console.log(
			chalk.blue(
				`------------------------------------------------------------------------------${
					this.client.config.isDevelopment ? '---' : this.client.config.isBeta ? '----' : ''
				}`
			)
		);

		const guilds = await Guild.findAll();
		const needToCreate = [];
		for (const [, guild] of this.client.guilds.cache) {
			const find = guilds.find((g) => guild.id === g.id);
			if (!find) needToCreate.push(guild.id);
		}
		await Guild.bulkCreate(needToCreate.map((id) => ({ id })));
	}
}
