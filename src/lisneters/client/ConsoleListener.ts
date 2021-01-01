//import { Message, MessageEmbed, TextChannel } from 'discord.js'
//import { BotListener } from '../../classes/BotListener'
import { Listener } from 'discord-akairo'
//import BotClient from '../../client/BotClient'


export default class ConsoleListener extends Listener {
	public constructor() {
		super('Console', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		})
	}

	public exec(): void {
		process.openStdin().addListener('data', res =>{
			const consoleInput =  res.toString().toString().split(/ +/g)
			if (consoleInput.toString().includes('test')){
				console.log('debug')
			}
		})
	}
}