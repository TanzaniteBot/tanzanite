import { BushInhibitor } from '../../lib/extensions/BushInhibitor';
import { Message } from 'discord.js';
import db from '../../constants/db';

export default class RoleBlacklistInhibitor extends BushInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist',
			type: 'all'
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = (await db.globalGet('superUsers', [])) as string[],
			roleBlacklist: string[] = (await db.globalGet('roleBlacklist', [])) as string[];
		if (!(this.client.config.owners.includes(message.author.id) || superUsers.includes(message.author.id))) {
			if (message.guild) {
				if (message.member.roles?.cache.some(r => roleBlacklist.includes(r.id))) {
					message.react(this.client.consts.mad);
					return true;
				} else {
					return false;
				}
			}
		}
	}
}
