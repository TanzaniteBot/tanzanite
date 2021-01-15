import { Message } from 'discord.js';
import { BotInhibitor } from '../../classes/BotInhibitor';
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'channelBlacklist',
		});
	}

	public exec(message: Message): boolean {
		if (
			!this.client.config.owners.includes(message.author.id) ||
			!this.client.config.superUsers.includes(message.author.id)
			/*||!message.member.roles.cache.some(r => this.client.config.roleWhitelist.includes(r.id))*/
		) {
			if (this.client.config.channelBlacklist.includes(message.channel.id)) {
				message.react('<:mad:783046135392239626>');
				return true;
			} else {
				return false;
			}
		}
	}
}
