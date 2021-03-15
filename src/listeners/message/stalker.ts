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

	public async exec(message: Message): Promise<void> {
		if (message.channel?.type === 'dm') return;
		if (botoptions.verbose) {
			console.info(`${chalk.bgGrey(functions.timeStamp())} ${chalk.grey('[Message]')} A message was sent by ${chalk.blackBright(message.author.tag)} in ${chalk.blackBright(message.channel.name)} in ${chalk.blackBright(message.guild.name)}.`);
		}

		const lastMessage = moment(message.author.lastMessage.createdTimestamp);
		const currentTime = moment(Date.now());
		if (lastMessage.isBefore(currentTime.subtract('10 minutes'))) return;
		if (message.author.id === '211288288055525376') {
			await this.client.users.fetch('322862723090219008').then(async (u) => {
				await u.send(`\`${message.author.tag}\` sent a message in <#${message.channel.id}>`).catch(() => {
					//
				});
			});
		}
	}
}
