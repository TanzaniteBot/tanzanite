import { BushListener, type BushClientEvents } from '#lib';
import { ChannelType, MessageEmbed } from 'discord.js';

export default class DirectMessageListener extends BushListener {
	public constructor() {
		super('directMessage', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (message.channel.type === ChannelType.DM) {
			if (!(message.author.id == client.user!.id) && message.author.bot) return;
			if (client.cache.global.blacklistedUsers.includes(message.author.id)) return;
			const dmLogEmbed = new MessageEmbed().setTimestamp().setFooter({ text: `User ID • ${message.channel.recipient.id}` });

			if (message.author.id != client.user!.id) {
				dmLogEmbed
					.setAuthor({
						name: `From: ${message.author.username}`,
						iconURL: `${message.author.displayAvatarURL()}`
					})
					.setDescription(`**DM:**\n${message}`)
					.setColor(util.colors.blue);
			} else {
				dmLogEmbed
					.setAuthor({
						name: `To: ${message.channel.recipient.username}`,
						iconURL: `${message.channel.recipient.displayAvatarURL()}`
					})
					.setDescription(`**DM:**\n${message}`)
					.setColor(util.colors.red)
					.setTimestamp();
			}
			if (message.attachments.filter((a) => typeof a.size == 'number').size == 1) {
				dmLogEmbed.setImage(message.attachments.filter((a) => typeof a.size == 'number').first()!.proxyURL);
			} else if (message.attachments.size > 0) {
				dmLogEmbed.addField('Attachments', message.attachments.map((a) => a.proxyURL).join('\n'));
			}
			const dmChannel = await util.getConfigChannel('dm');
			await dmChannel.send({ embeds: [dmLogEmbed] });
		}
	}
}
