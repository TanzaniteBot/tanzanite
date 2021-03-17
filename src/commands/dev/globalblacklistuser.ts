import { BotCommand, PermissionLevel } from '../../lib/extensions/BotCommand';
import { Message, User } from 'discord.js';
import db from '../../constants/db';

export default class GlobalBlacklistUserCommand extends BotCommand {
	public constructor() {
		super('globalblacklistuser', {
			aliases: ['globalblacklistuser', 'gbuser', 'blacklist'],
			category: 'dev',
			description: {
				content: 'A command to add/remove blacklisted users.',
				usage: 'globalblacklistuser <user>',
				examples: ['globalblacklistuser IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					match: 'content',
					prompt: {
						start: 'Which user would you like to change the blacklisted status of?',
						retry: '<:no:787549684196704257> Choose a valid user.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.util.reply('Only owners can use this command.');
			return;
		}
		const userBlacklist: string[] = (await db.globalGet('userBlacklist', [])) as string[];
		let action: string;
		if (!userBlacklist || !userBlacklist.includes(user.id)) {
			userBlacklist.push(user.id);
			await db.globalUpdate('userBlacklist', userBlacklist);
			action = 'added';
		} else {
			userBlacklist.splice(userBlacklist.indexOf(user.id), 1);
			await db.globalUpdate('userBlacklist', userBlacklist);
			action = 'removed';
		}
		let action2;
		if (action == 'removed') {
			action2 = 'from';
		} else {
			action2 = 'to';
		}
		await message.util.reply(`Successfully ${action} \`${user.tag}\` ${action2} the blacklisted users list.`);
		return;
	}
}
