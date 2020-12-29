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
			.setAuthor(message.author.username, message.author.avatarURL())
			.setColor('00ffff')
			.setThumbnail(message.guild.iconURL())
			.setTitle('This is the Title.')
			.setURL('https://www.youtube.com/watch?v=DLzxrzFCyOs')
			.setFooter('This is a footer','https://cdn.discordapp.com/icons/450878205294018560/a_f5cc2a5e89cd5acae89622e47cee5b30.gif?size=1024')
			.setTimestamp()
			.setImage('https://cdn.discordapp.com/attachments/785661398566567976/792780370478759936/10x-featured-social-media-image-size.png')
		//message.author
		return message.util.send(embed)
		
	}
}
