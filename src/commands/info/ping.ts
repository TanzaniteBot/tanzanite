import { CommandInteraction } from 'discord.js';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';

export default class PingCommand extends BushCommand {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			description: {
				content: 'Gets the latency of the bot',
				usage: 'ping',
				examples: ['ping']
			}
		});
	}

	public async exec(message: Message): Promise<void> {
		const sentMessage = await message.util.send('Pong!');
		const timestamp: number = message.editedTimestamp
			? message.editedTimestamp
			: message.createdTimestamp;
		const botLatency = `\`\`\`\n ${Math.floor(
			sentMessage.createdTimestamp - timestamp
		)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(
			message.client.ws.ping
		)}ms \`\`\``;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(
				message.author.username,
				message.author.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp();
		await sentMessage.edit({
			content: null,
			embed
		});
	}

	public async execSlash(message: CommandInteraction): Promise<void> {
		const timestamp1 = message.createdTimestamp;
		await message.reply('Pong!');
		const timestamp2 = await message
			.fetchReply()
			.then((m) => (m as Message).createdTimestamp);
		const botLatency = `\`\`\`\n ${Math.floor(
			timestamp2 - timestamp1
		)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(this.client.ws.ping)}ms \`\`\``;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(
				message.user.username,
				message.user.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp();
		await message.editReply({
			content: null,
			embeds: [embed]
		});
	}
}
