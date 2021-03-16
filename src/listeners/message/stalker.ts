import { Message } from 'discord.js';
import moment from 'moment';
import { BotListener } from '../../extensions/BotListener';
import * as botoptions from '../../config/botoptions';
import chalk from 'chalk';
import functions from '../../constants/functions';

export default class StalkerListener extends BotListener {
	public constructor() {
		super('StalkerListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public exec(message: Message): Promise<void> {
		if (message.channel?.type === 'dm') return;
		if (botoptions.verbose) {
			console.info(`${chalk.bgGrey(functions.timeStamp())} ${chalk.grey('[Message]')} A message was sent by ${chalk.blackBright(message.author.tag)} in ${chalk.blackBright(message.channel.name)} in ${chalk.blackBright(message.guild.name)}.`);
		}
	}
}
