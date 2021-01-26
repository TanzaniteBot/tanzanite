import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message } from 'discord.js';
// noinspection DuplicatedCode (tf is this?)
export default class UserBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist',
			type: 'all'
		});
	}

	public exec(message: Message): boolean {
		if (!(this.client.config.owners.includes(message.author.id) || this.client.config.superUsers.includes(message.author.id))) {
			if (this.client.config.userBlacklist.includes(message.author.id)) {
				// message.react(this.client.consts.mad);
				return true;
			} else {
				return false;
			}
		}
	}
}
