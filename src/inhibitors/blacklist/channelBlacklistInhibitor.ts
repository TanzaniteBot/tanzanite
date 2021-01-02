import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'Channel Blacklisted'
		})
	}

	public exec(message: Message): boolean {
		if(!this.client.config.owners.includes(message.author.id)||!this.client.config.superUsers.includes(message.author.id)||!message.member.roles.cache.some(r => this.client.config.roleWhitelist.includes(r.id))){	
			if (this.client.config.channelBlacklist.includes(message.channel.id || message.author.id)){
				return true
			}else{
				return false
			}
			
		}
	}
}