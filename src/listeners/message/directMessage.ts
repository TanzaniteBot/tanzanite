import { BotListener, colors, Emitter, type BotClientEvents } from '#lib';
import { ChannelType, EmbedBuilder, Events } from 'discord.js';

export default class DirectMessageListener extends BotListener {
	public constructor() {
		super('directMessage', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents['messageCreate']) {
		if (message.channel.type === ChannelType.DM) {
			if (!(message.author.id == this.client.user!.id) && message.author.bot) return;
			if (this.client.cache.global.blacklistedUsers.includes(message.author.id)) return;

			const dmLogEmbed = new EmbedBuilder()
				.setTimestamp()
				.setFooter({ text: `User ID • ${message.channel.recipientId}` })
				.setDescription(`**DM:**\n${message.content}`);

			if (message.author.id != this.client.user!.id) {
				dmLogEmbed
					.setAuthor({
						name: `From: ${message.author.username}`,
						iconURL: `${message.author.displayAvatarURL()}`
					})
					.setColor(colors.blue);
			} else {
				dmLogEmbed
					.setAuthor({
						name: `To: ${message.channel.recipient?.username ?? `<unknown recipient in ${message.channel}>`}`,
						iconURL: message.channel.recipient?.displayAvatarURL()
					})
					.setColor(colors.red);
			}
			if (message.attachments.filter((a) => typeof a.size == 'number').size == 1) {
				dmLogEmbed.setImage(message.attachments.filter((a) => typeof a.size == 'number').first()!.proxyURL);
			} else if (message.attachments.size > 0) {
				dmLogEmbed.addFields({ name: 'Attachments', value: message.attachments.map((a) => a.proxyURL).join('\n') });
			}
			const dmChannel = await this.client.utils.getConfigChannel('dm');
			if (dmChannel === null) return;
			await dmChannel.send({ embeds: [dmLogEmbed] });
		}
	}
}
