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

	public async exec(message: Message): Promise<void> {
		// on dm
		if(message.channel.type === 'dm') {
			if (message.author.bot) return
			if ((await this.client.commamdHandler.parseCommand(message)).command) return
			// add a thing to send it so a specific channel
			const dmlogembed = new MessageEmbed()
				.setAuthor(`From: ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`**DM:**\n${message}`)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.setColor(this.client.consts.DefaultColor)
				.setTimestamp()
				.setFooter(`ID • ${message.author.id}`)
			const dmchannel = <TextChannel> this.client.channels.cache.get('783129374551572512') // temp hardcoded, will fix later
			dmchannel.send(dmlogembed)
		}
		// put other shit here
	}
}
