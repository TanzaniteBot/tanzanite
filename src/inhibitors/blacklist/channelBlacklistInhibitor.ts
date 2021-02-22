import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
import BotClient from '../../extensions/BotClient';
import functions from '../../constants/functions';

// noinspection DuplicatedCode
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'channelBlacklist',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		if(!message.guild) return false
		const superUsers: string[] = await functions.dbGet('global', 'superUsers', this.client.config.environment) as string[],
			roleWhitelist: string[] = await functions.dbGet('global', 'roleWhitelist', this.client.config.environment) as string[],
			channelBlacklist: string[] = await functions.dbGet('global', 'channelBlacklist', this.client.config.environment) as string[];
		if (
			!(this.client.ownerID.includes(message.author.id) 
			|| superUsers.includes(message.author.id) 
			|| message.member.roles.cache.some(r => roleWhitelist.includes(r.id)))
		) {
			if (channelBlacklist.includes(message.channel.id)) {
				message.react(this.client.consts.mad);
				return true;
			} else {
				return false;
			}
		}
	}
}
