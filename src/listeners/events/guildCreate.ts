import { Guild } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';
import * as botoptions from '../../config/botoptions';
import chalk from 'chalk';
import functions from '../../constants/functions';

export default class guildCreateListener extends BotListener {
	public constructor() {
		super('guildCreateListener', {
			emitter: 'client',
			event: 'guildCreate', //when the bot joins a guild
			category: 'client'
		});
	}

	public exec(guild: Guild): void {
		if (botoptions.info) {
			console.info(`${chalk.bgCyan(functions.timeStamp())} ${chalk.cyan('[Info]')} Joined ${chalk.blueBright(guild.name)} with ${chalk.blueBright(guild.memberCount)} members.`);
		}
	}
}
