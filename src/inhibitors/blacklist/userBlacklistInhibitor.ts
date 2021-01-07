import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class UserBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist'
		})
	}

	public exec(message: Message): boolean {
		if(!this.client.config.owners.includes(message.author.id)
		||!this.client.config.superUsers.includes(message.author.id)){	
			if (this.client.config.userBlacklist.includes(message.author.id)){
				return true
			}else{
				return false
			}
			
		}
	}
}
