import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { BotListener } from '../../classes/BotListener'


export default class ReadyListener extends BotListener {
	public constructor() {
		super('MessageListener', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		})
	}

	public async exec(message: Message): Promise<void> {
		// on dm
		if(message.channel.type === 'dm') {
			if (message.author.bot) return
			const dmlogembed = new MessageEmbed()
				.setAuthor(`From: ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`**DM:**\n${message}`)
				.setColor(this.client.consts.DefaultColor)
				.setTimestamp()
				.setFooter(`ID • ${message.author.id}`)
			const dmchannel = <TextChannel> this.client.channels.cache.get(this.client.config.dmChannel)
			dmchannel.send(dmlogembed)
		}
		// put other shit here
	}
}
