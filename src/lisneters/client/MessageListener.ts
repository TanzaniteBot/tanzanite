import { Listener } from 'discord-akairo'
import { Message, MessageEmbed, TextChannel } from 'discord.js'

export default class ReadyListener extends Listener {
	public constructor() {
		super('MessageListener', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		})
	}

	public exec(message: Message): void {
		// on dm
		if(message.channel.type === 'dm') {
			if (message.author.bot) return
			// add a thing to send it so a specific channel
			const dmlogembed = new MessageEmbed()
				.setAuthor(`From: ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`**DM:**\n${message}`)
				.setTimestamp()
				.setFooter(`ID • ${message.author.id}`)
			const dmchannel = <TextChannel> this.client.channels.cache.get('783129374551572512') // temp hardcoded, will fix later
			dmchannel.send(dmlogembed)
		}
		// put other shit here
	}
}
