import { Message, MessageEmbed } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class PingCommand extends BushCommand {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			description: {
				content: 'Gets the latency of the bot',
				usage: 'ping',
				examples: ['ping']
			},
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['SEND_MESSAGES'],
			slash: true
		});
	}

	public async exec(message: BushMessage): Promise<void> {
		const sentMessage = (await message.util.send('Pong!')) as Message;
		const timestamp: number = message.editedTimestamp ? message.editedTimestamp : message.createdTimestamp;
		const botLatency = `\`\`\`\n ${Math.floor(sentMessage.createdTimestamp - timestamp)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(message.client.ws.ping)}ms \`\`\``;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
			.setColor(this.client.util.colors.default)
			.setTimestamp();
		await sentMessage.edit({
			content: null,
			embeds: [embed]
		});
	}

	public async execSlash(message: BushSlashMessage): Promise<void> {
		const timestamp1 = message.interaction.createdTimestamp;
		await message.interaction.reply('Pong!');
		const timestamp2 = await message.interaction.fetchReply().then((m) => (m as Message).createdTimestamp);
		const botLatency = `\`\`\`\n ${Math.floor(timestamp2 - timestamp1)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(this.client.ws.ping)}ms \`\`\``;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(message.interaction.user.username, message.interaction.user.displayAvatarURL({ dynamic: true }))
			.setColor(this.client.util.colors.default)
			.setTimestamp();
		await message.interaction.editReply({
			content: null,
			embeds: [embed]
		});
	}
}
