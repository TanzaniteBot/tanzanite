import { Message    , TextChannel, MessageEmbed } from 'discord.js'                  ;
import { BotListener                            } from '../../extensions/BotListener';

export default class APListener extends BotListener {
	public constructor() {
		super('APListener', {
			emitter: 'client',
			event: 'message',
			category: 'message',
		});
	}

	public async exec(message: Message): Promise<void> {
		if(!message.guild) return


		if (message.channel.type === 'news' && this.client.config.autoPublishChannels.some((x) => message.channel.id.includes(x))) {
			const PublishEmbed = new MessageEmbed()
				.setTitle('Found an unpublished message')
				.addField('MSG Link', `[link](${message.url})`, false)
				.addField('Channel', `<#${message.channel.id}>`, false)
				.setColor(this.client.consts.Red)
				.setFooter(`${message.guild.id}`, message.guild.iconURL())
				.setTimestamp();
			await message.crosspost();
			await this.log(PublishEmbed).then((msg) => {
				PublishEmbed.setTitle('Published a message');
				PublishEmbed.setColor(this.client.consts.Green);
				msg.edit(PublishEmbed);
			});
		}
	}
}
