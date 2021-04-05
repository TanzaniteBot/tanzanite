import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message, User } from 'discord.js';
import db from '../../constants/db';

export default class ChannelBypassCommand extends BushCommand {
	public constructor() {
		super('channelbypass', {
			aliases: ['channelbypass', 'bypasschannel'],
			category: 'dev',
			description: {
				content: 'A command to add people that bypass the channel blacklist.',
				usage: 'superuser <user>',
				examples: ['superuser IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					match: 'content',
					prompt: {
						start:
							'What user would you like to change the channel bypass status of?',
						retry: '<:no:787549684196704257> Choose a valid user.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES'],
			hidden: true
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		//
	}
}
