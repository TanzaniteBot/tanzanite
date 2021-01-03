import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'Channel Blacklisted'
		})
	}

	public exec(message: Message): boolean {
		console.log('debug 0')
		if(!this.client.config.owners.includes(message.author.id)||!this.client.config.superUsers.includes(message.author.id)||!message.member.roles.cache.some(r => this.client.config.roleWhitelist.includes(r.id))){	
			console.log('debug 1')
			if (this.client.config.channelBlacklist.includes(message.channel.id)){
				console.log('debug 2')
				return true
			}else{
				console.log('debug 3')
				return false
			}
		}
	}
}