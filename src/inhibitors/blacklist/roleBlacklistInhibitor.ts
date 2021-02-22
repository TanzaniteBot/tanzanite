import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message} from 'discord.js';
import BotClient from '../../extensions/BotClient';
import functions from '../../constants/functions';

export default class RoleBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = await functions.dbGet('global', 'superUsers', this.client.config.environment) as string[],
			roleBlacklist: string[] = await functions.dbGet('global', 'roleBlacklist', this.client.config.environment) as string[];
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
