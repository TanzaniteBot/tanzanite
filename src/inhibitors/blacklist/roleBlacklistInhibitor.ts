import { Message } from 'discord.js';
import { BotInhibitor } from '../../../libs/extensions/BotInhibitor';
export default class RoleBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('roleBlacklist', {
			reason: 'roleBlacklist',
		});
	}

	public exec(message: Message): boolean {
		if (!this.client.config.owners.includes(message.author.id) || !this.client.config.superUsers.includes(message.author.id)) {
			if (message.guild) {
				if (message.member.roles.cache.some((r) => this.client.config.roleBlacklist.includes(r.id))) {
					message.react('<:mad:783046135392239626>');
					return true;
				} else {
					return false;
				}
			}
		}
	}
}
