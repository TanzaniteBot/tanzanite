import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';

// noinspection DuplicatedCode
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'channelBlacklist',
		});
	}

	public exec(message: Message): boolean {
		if ((this.client.ownerID.includes(message.author.id) != true) ||(this.client.config.superUsers.includes(message.author.id) != true)/*||this.client.config.roleWhitelist.includes(message.author.id) (message.member.roles.cache.some(r => this.client.config.roleWhitelist.includes(r.id)) != true)*/) {
			if (this.client.config.channelBlacklist.includes(message.channel.id)) {
				message.react(this.client.consts.mad);
				return true;
			} else {
				return false;
			}
		}
	}
}
