/*import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { BotListener } from '../../classes/BotListener'
import { Listener } from 'discord-akairo'
import BotClient from '../../client/BotClient'


export default class ConsoleListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		})
	}

	

	public exec(): void {

		process.openStdin().addListener('data', res =>{
			const console =  res.toString().toString().split(/ +/g)
			const channel = <TextChannel> this.client.channels.cache.get('793285496817844245')
			channel.send(console)

		})
		
	}
}*/