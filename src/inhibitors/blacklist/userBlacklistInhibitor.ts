import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
// noinspection DuplicatedCode (tf is this?)
export default class UserBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist',
		});
	}

	public exec(message: Message): boolean {
		if (!this.client.config.owners.includes(message.author.id) || !this.client.config.superUsers.includes(message.author.id)) {
			if (this.client.config.userBlacklist.includes(message.author.id)) {
				message.react('<:mad:783046135392239626>');
				return true;
			} else {
				return false;
			}
		}
	}
}
