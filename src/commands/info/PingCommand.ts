import { MessageEmbed } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotMessage } from '../../lib/extensions/BotMessage';

export default class PingCommand extends BotCommand {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			description: {
				content: 'Gets the latency of the bot',
				usage: 'ping',
				examples: ['ping']
			}
		});
	}

	public async exec(message: BotMessage): Promise<void> {
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
}
