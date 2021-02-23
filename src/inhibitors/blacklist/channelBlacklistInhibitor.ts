import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
import BotClient from '../../extensions/BotClient';
import db from '../../constants/db';

// noinspection DuplicatedCode
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'channelBlacklist',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		if(!message.guild) return false
		const superUsers: string[] = await db.globalGet('superUsers', []) as string[],
			roleWhitelist: string[] = await db.globalGet('roleWhitelist', []) as string[],
			channelBlacklist: string[] = await db.globalGet('channelBlacklist', []) as string[];
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
