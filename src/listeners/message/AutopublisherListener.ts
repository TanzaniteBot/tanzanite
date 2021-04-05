import { Message, MessageEmbed } from 'discord.js';
import db from '../../constants/db';
import log from '../../lib/utils/log';
import { BushListener } from '../../lib/extensions/BushListener';

export default class autoPublisherListener extends BushListener {
	public constructor() {
		super('autoPublisherListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		if (!message.guild) return;
		const autoPublishChannels: string[] = (await db.guildGet(
			'autoPublishChannels',
			message.guild.id,
			[]
		)) as string[];
		if (autoPublishChannels) {
			if (
				message.channel.type === 'news' &&
				autoPublishChannels.some(x => message.channel.id.includes(x))
			) {
				let success = true;
				const PublishEmbed = new MessageEmbed()
					.setTitle('Found an unpublished message')
					.addField('MSG Link', `[link](${message.url})`, false)
					.addField('Channel', `<#${message.channel.id}>`, false)
					.setColor(this.client.consts.Red)
					.setFooter(`${message.guild.id}`, message.guild.iconURL())
					.setTimestamp();
				await message.crosspost().catch(() => {
					log.warn(
						'AutoPublisher',
						`Failed to publish <<${message.id}>> in <<${message.guild.name}>>.`
					);
					return (success = false);
				});
				await this.log(PublishEmbed)
					.then(msg => {
						PublishEmbed.setTitle('Published a message');
						PublishEmbed.setColor(this.client.consts.Green);
						msg.edit(PublishEmbed);
					})
					.catch(() => {
						log.warn(
							'AutoPublisher',
							`Failed to send log message in <<${message.guild.name}>>.`
						);
						return (success = false);
					});
				if (this.client.config.info && success) {
					log.info(
						'AutoPublisher',
						`Published a message in <<${message.channel?.name}>> in <<${message.guild?.name}>>.`
					);
				}
			}
		}
	}
}
