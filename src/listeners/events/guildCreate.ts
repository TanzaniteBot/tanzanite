import { Guild } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';
import * as botoptions from '../../config/botoptions';
import chalk from 'chalk';

export default class guildCreateListener extends BotListener {
	public constructor() {
		super('guildCreateListener', {
			emitter: 'client',
			event: 'guildCreate', //when the bot joins a guild
			category: 'client'
		});
	}

	public exec(guild: Guild): void {
		if (botoptions.verbose) {
			console.info(chalk.bgCyan('[Info]') + ' Joined ' + chalk.cyan(guild.name) + ' with ' + chalk.cyan(guild.memberCount) + ' members.');
		}
	}
}
