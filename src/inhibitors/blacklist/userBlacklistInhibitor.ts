import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Message} from 'discord.js';
import BotClient from '../../extensions/BotClient';
import functions from '../../constants/functions';
// noinspection DuplicatedCode (tf is this?)
export default class UserBlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist',
			type: 'all'
		});
	}

	public async exec(message: Message): Promise<boolean> {
		const superUsers: string[] = await functions.dbGet('global', 'superUsers') as string[],
			userBlacklist: string[] = await functions.dbGet('global', 'userBlacklist') as string[];
		if (!(this.client.config.owners.includes(message.author.id) || superUsers.includes(message.author.id))) {
			if (userBlacklist.includes(message.author.id)) {
				// message.react(this.client.consts.mad);
				return true;
			} else {
				return false;
			}
		}
	}
}
