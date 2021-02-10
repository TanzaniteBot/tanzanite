import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message} from 'discord.js';
import BotClient from '../../extensions/BotClient';

export default class RoleBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'superUsers', [])
		const roleBlacklist: string[] = await (this.client as BotClient).globalSettings.get(this.client.user.id, 'roleBlacklist', [])
		if (!(this.client.config.owners.includes(message.author.id) 
		|| superUsers.includes(message.author.id))) {
			if (message.guild) {
				if (message.member.roles.cache.some((r) => roleBlacklist.includes(r.id))) {
					message.react(this.client.consts.mad);
					return true;
				} else {
					return false;
				}
			}
		}
	}
}
