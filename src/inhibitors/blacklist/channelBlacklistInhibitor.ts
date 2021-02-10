import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
import BotClient from '../../extensions/BotClient';

// noinspection DuplicatedCode
export default class ChannelBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('channelBlacklist', {
			reason: 'channelBlacklist',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'superUsers', []),
			roleWhitelist: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'roleWhitelist', []),
			channelBlacklist: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'channelBlacklist', []);
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
