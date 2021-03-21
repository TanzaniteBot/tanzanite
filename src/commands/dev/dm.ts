import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message, User } from 'discord.js';

export default class DMCommand extends BushCommand {
	public constructor() {
		super('dm', {
			aliases: ['dm'],
			category: 'dev',
			description: {
				content: 'Use the command to dm a specified user',
				usage: 'dm <user> <message to send to the user>',
				examples: ['dm TrashCan bad lol noob get good', 'dm ironm00n noob get good smh my head']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to send the dm to',
						retry: '<:no:787549684196704257> Choose a valid user.'
					}
				},
				{
					id: 'dmmessage',
					match: 'rest',
					type: 'string',
					prompt: {
						start: 'What message would you like to send to the user',
						retry: '<:no:787549684196704257> Invalid message.'
					}
				},
				{
					id: 'silent',
					match: 'flag',
					flag: '--silent'
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			permissionLevel: PermissionLevel.Superuser,
			clientPermissions: ['SEND_MESSAGES'],
			typing: true
		});
	}

	public async exec(message: Message, { user, dmmessage, silent }: { user: User; dmmessage: string; silent: boolean }): Promise<void> {
		if (message.author.id != '322862723090219008') {
			message.reply('moulberry said no more -say');
			return;
		}

		try {
			await user.send(dmmessage);
			if (silent) {
				await message.util.send(`Dm sent to ${user.tag}!`);
			} else {
				try {
					await message.delete();
				} catch (e) {
					// pass
				}
			}
		} catch (e) {
			if (!silent) {
				await message.util.reply('Error occurred when sending:\n' + (await this.client.consts.haste(e.stack)));
			} else {
				await message.react('<:no:787549684196704257>');
			}
		}
	}
}
