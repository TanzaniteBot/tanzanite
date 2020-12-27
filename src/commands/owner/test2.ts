import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'

export default class Test2Command extends Command {
	public constructor() {
		super('test2', {
			aliases: ['test2'],
			category: 'owner',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Another testing command',
				usage: 'test2',
				examples: [
					'test2'
				],
			},
			ownerOnly: true
		})
	}
	public async exec(message: Message): Promise<Message> {
		const embed = new MessageEmbed()
			.addField('Name of Field','Value of field')
			.setDescription('This is the description')
			.setAuthor(message.author.username, message.author.avatarURL.toString())
			.setColor('ffffff')
		return message.util.send(embed)
	}
}