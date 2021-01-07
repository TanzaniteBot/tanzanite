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
			const consoleInput =  res.toString().split(/ +/g)
			if (consoleInput.toString().startsWith('eval ')){
				console.log('abc')
				try{
					const input = consoleInput.toString().replace('eval ','')
					const output = eval(input)
					console.log(output)
				}catch(e){
					console.log(e)
				}
				
			}
		})
	}
}