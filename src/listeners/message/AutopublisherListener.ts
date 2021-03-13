import chalk from 'chalk';
import { Message, TextChannel, MessageEmbed } from 'discord.js';
import db from '../../constants/db';
import functions from '../../constants/functions';
import { BotListener } from '../../extensions/BotListener';

export default class autoPublisherListener extends BotListener {
	public constructor() {
		super('autoPublisherListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		if (!message.guild) return;
		const autoPublishChannels: string[] = (await db.guildGet('autoPublishChannels', message.guild.id, [])) as string[];
		if (autoPublishChannels) {
			if (message.channel.type === 'news' && autoPublishChannels.some((x) => message.channel.id.includes(x))) {
				let success = true;
				const PublishEmbed = new MessageEmbed().setTitle('Found an unpublished message').addField('MSG Link', `[link](${message.url})`, false).addField('Channel', `<#${message.channel.id}>`, false).setColor(this.client.consts.Red).setFooter(`${message.guild.id}`, message.guild.iconURL()).setTimestamp();
				await message.crosspost().catch(() => {
					console.warn(`${chalk.bgYellow(`${functions.timeStamp()} [autoPublisher]`)} Failed to publish ${chalk.blueBright(message.id)} in ${chalk.blueBright(message.guild.name)}.`);
					return (success = false);
				});
				await this.log(PublishEmbed)
					.then((msg) => {
						PublishEmbed.setTitle('Published a message');
						PublishEmbed.setColor(this.client.consts.Green);
						msg.edit(PublishEmbed);
					})
					.catch(() => {
						console.warn(`${chalk.bgYellow(`${functions.timeStamp()} [autoPublisher]`)} Failed to send log message in ${chalk.blueBright(message.guild.name)}.`);
						return (success = false);
					});
				if (this.client.config.verbose && success) {
					console.info(`${chalk.bgCyan(`${functions.timeStamp()} [autoPublisher]`)} Published a message in ${chalk.blueBright(message.channel?.name)} in ${chalk.blueBright(message.guild?.name)}.`);
				}
			}
		}
	}
}
