import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class RoleBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist'
		})
	}

	public exec(message: Message): boolean {
		if(!this.client.config.owners.includes(message.author.id)
		||!this.client.config.superUsers.includes(message.author.id)){	
			if (message.member.roles.cache.some(r => this.client.config.roleBlacklist.includes(r.id))){
				return true
			}else{
				return false
			}
			
		}
	}
}
