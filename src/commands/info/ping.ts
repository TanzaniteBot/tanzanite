import { BotCommand } from '../../classes/BotCommand'
import { Message, MessageEmbed } from 'discord.js'

export default class ReloadCommand extends BotCommand {
	public constructor() {
		super('ping', {
			aliases: ['ping', 'pong'],
			category: 'info',
			description: {
				usage: 'ping',
				examples: [
					'ping'
				],
				content: 'Gives the latency of the bot.'
			},
			ratelimit: 4,
			cooldown: 4000,
		})
	}
	public async exec(message: Message): Promise<void> {
		const replyMsg: Message = await message.util.send(`${(message.util.parsed.alias == 'ping') ? 'Ping' : 'Pong'}?`)
		const timestamp: number = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp
		const latency = `\`\`\`\n ${Math.floor(replyMsg.createdTimestamp - timestamp)}ms \`\`\``
		const apiLatency = `\`\`\`\n ${Math.round(message.client.ws.ping)}ms \`\`\``
		const embed: MessageEmbed = new MessageEmbed()
			.setTitle(`${(message.util.parsed.alias == 'ping') ? 'pong' : 'ping'}!  🏓`)
			.addField('Latency', latency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
		replyMsg.edit(embed)
	}
}