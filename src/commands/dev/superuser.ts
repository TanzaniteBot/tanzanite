import { BotCommand, PermissionLevel } from '../../lib/extensions/BotCommand';
import { Message, User } from 'discord.js';
import db from '../../constants/db';

export default class SuperUserCommand extends BotCommand {
	public constructor() {
		super('superuser', {
			aliases: ['superuser', 'unsuperuser'],
			category: 'dev',
			description: {
				content: 'A command to add/remove superusers.',
				usage: 'superuser <user>',
				examples: ['superuser IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					match: 'content',
					prompt: {
						start: 'What user would you like to change the superuser status of?',
						retry: '<:no:787549684196704257> Choose a valid user.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.util.reply('Only owners can use this command.');
			return;
		}
		const superUsers: string[] = (await db.globalGet('superUsers', [])) as string[];
		let action: string;
		if (!superUsers || !superUsers.includes(user.id)) {
			superUsers.push(user.id);
			await db.globalUpdate('superUsers', superUsers);
			action = 'added';
		} else {
			superUsers.splice(superUsers.indexOf(user.id), 1);
			await db.globalUpdate('superUsers', superUsers);
			action = 'removed';
		}
		let action2;
		if (action == 'removed') {
			action2 = 'from';
		} else {
			action2 = 'to';
		}
		await message.util.reply(`Successfully ${action} \`${user.tag}\` ${action2} the super users list.`);
		await this.log(`\`${user.tag}\` was ${action} ${action2} the super users list.`);
		return;
	}
}
