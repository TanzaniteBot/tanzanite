import { BotListener, Emitter, Guild, type BotClientEvents } from '#lib';
import { commas } from '#lib/common/tags.js';
import { humanizeDuration } from '@notenoughupdates/humanize-duration';
import chalk from 'chalk';
import { Events } from 'discord.js';
import { performance } from 'perf_hooks';

export default class ReadyListener extends BotListener {
	public constructor() {
		super('ready', {
			emitter: Emitter.Client,
			event: Events.ClientReady
		});
	}

	// eslint-disable-next-line no-empty-pattern
	public async exec(...[]: BotClientEvents[Events.ClientReady]) {
		performance.mark('clientReady');

		process.emit('ready' as any);

		const tag = `<<${this.client.user?.tag}>>`,
			guildCount = commas`<<${this.client.guilds.cache.size}>>`,
			userCount = commas`<<${this.client.users.cache.size}>>`;

		void this.client.logger.success('ready', `Logged in to ${tag} serving ${guildCount} guilds and ${userCount} users.`);

		console.log(chalk.blue('-'.repeat(84 + (this.client.config.isDevelopment ? 3 : this.client.config.isBeta ? 4 : 0))));

		const measure = performance.measure('start', 'processStart', 'clientReady');

		void this.client.logger.info(
			'ready',
			`Took <<${humanizeDuration(measure.duration, {
				language: 'en',
				largest: 3,
				round: false,
				maxDecimalPoints: 3
			})}>> to start.`
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
