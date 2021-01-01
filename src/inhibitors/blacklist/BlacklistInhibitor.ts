import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		})
	}

	public exec(message: Message): boolean {
		const blacklist = ['']
		if(message.author.id === this.client.config.owners){
			console.log('owner')
		}else{
			console.log('not owner')
			return blacklist.includes(message.author.id || message.channel.id)
		}
	}
}