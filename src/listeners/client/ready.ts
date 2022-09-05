import { BotClientEvents, BotListener, Emitter, Guild } from '#lib';
import chalk from 'chalk';
import { Events } from 'discord.js';

export default class ReadyListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: Emitter.Client,
			event: Events.ClientReady
		});
	}

	// eslint-disable-next-line no-empty-pattern
	public async exec(...[]: BotClientEvents[Events.ClientReady]) {
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
