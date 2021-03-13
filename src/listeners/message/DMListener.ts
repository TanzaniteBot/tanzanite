import { Message, MessageEmbed, TextChannel } from 'discord.js';
import db from '../../constants/db';
import { BotListener } from '../../extensions/BotListener';
export default class DMListener extends BotListener {
	public constructor() {
		super('DMListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		try {
			if (message.channel.type === 'dm') {
				if (!(message.author.id == this.client.user.id) && message.author.bot) return;
				let dmlogembed: MessageEmbed;

				if (message.author.id != this.client.user.id) {
					dmlogembed = new MessageEmbed()
						.setAuthor(`From: ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
						.setDescription(`**DM:**\n${message}`)
						//.addField('To:', this.client.user.tag)
						//.addField('From:', message.author.tag)
						.setColor(this.client.consts.Blue)
						.setTimestamp()
						.setFooter(`User ID • ${message.author.id}`);

					if (message.attachments.size > 0) {
						const fileName = message.attachments.first().name.toLowerCase();
						if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.gif') || fileName.endsWith('.webp')) {
							dmlogembed.setImage(message.attachments.first().url);
						} else {
							dmlogembed.addField('Attachment', message.attachments.first().url);
						}
					}
				} else {
					dmlogembed = new MessageEmbed()
						.setAuthor(`To: ${message.channel.recipient.username}`, `${message.channel.recipient.displayAvatarURL({ dynamic: true })}`)
						.setDescription(`**DM:**\n${message}`)
						//.addField('To:', message.channel.recipient.tag)
						//.addField('From:', this.client.user.tag)
						.setColor(this.client.consts.Purple)
						.setTimestamp()
						.setFooter(`ID • ${message.author.id}`);
				}
				if (message.attachments.filter((a) => typeof a.size == 'number').size == 1) {
					dmlogembed.setImage(message.attachments.filter((a) => typeof a.size == 'number').first().proxyURL);
				} else if (message.attachments.size > 0) {
					dmlogembed.addField('Attachments', message.attachments.map((a) => a.proxyURL).join('\n'));
				}
				const dmChannelid = await db.globalGet('dmChannel', '783129374551572512');
				const dmchannel = <TextChannel>this.client.channels.cache.get(dmChannelid as string);
				await dmchannel.send(dmlogembed);
			}
		} catch {
			return;
		}
	}
}
