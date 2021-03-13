import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
import BotClient from '../../extensions/BotClient';
import db from '../../constants/db';

export default class RoleBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist'
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = (await db.globalGet('superUsers', [])) as string[],
			roleBlacklist: string[] = (await db.globalGet('roleBlacklist', [])) as string[];
		if (!(this.client.config.owners.includes(message.author.id) || superUsers.includes(message.author.id))) {
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
