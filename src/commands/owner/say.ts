import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import BotClient from '../../client/BotClient'

export default class SayCommand extends Command {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'owner',
			description: {
				content: 'A command to test shit',
				usage: 'test',
				examples: [
					'test'
				]
			},
			ownerOnly: true
		})
	}
	public async exec(message: Message): Promise<void> {
		const client = <BotClient> this.client
		const url: string = await client.consts.haste('text')
		const errorlogembed = new MessageEmbed()
			.setTitle('A error occured')
			.setDescription('**User:** PLACEHOLDER\n**Command:** PLACEHOLDER\n**Channel:** PLACEHOLDER')
			.addField('Error', `${url}`)
			.setColor('#1FD8F1')
			.setTimestamp()
		message.util.send(errorlogembed)
	}
}