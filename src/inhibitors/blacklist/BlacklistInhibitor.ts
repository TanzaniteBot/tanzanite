import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		})
	}

	public exec(message: Message): boolean {
		if(!this.client.config.owners.includes(message.author.id)||!message.member.roles.cache.some(r => this.client.config.whitelist.includes(r.id))){	
			if (this.client.config.blacklist.includes(message.channel.id || message.author.id)){
				return true
			}else{
				return false
			}
			
		}
	}
}