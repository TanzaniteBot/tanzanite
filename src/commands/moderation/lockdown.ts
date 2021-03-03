import { BotCommand } from '../../extensions/BotCommand';
import { Message, TextChannel, NewsChannel, Role } from 'discord.js';

export default class LockDownCommand extends BotCommand {
	public constructor() {
		super('Lockdown', {
			aliases: ['Lockdown', 'Unlockdown'],
			category: 'moderation',
			description: {
				content: 'A command to quickly prevent certain roles from talking in channels.',
				usage: 'Lockdown <messages>',
				examples: ['Purge'],
			},
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'channel',
					type: 'channel',
					default: null,
				},
				{
					id: 'allowedRole',
					type: 'role',
				},
			],
			channel: 'guild',
		});
	}
	public exec(message: Message, { channel, allowedRole }: { channel: TextChannel | NewsChannel; allowedRole: Role }): Promise<void> {
		if (message.channel.type === 'dm') {
			message.channel.send('This command cannot be run in DMs.');
			return;
		}
		if (message.channel.guild.id !== '516977525906341928') {
			message.channel.send('This command can only be run in Moulberry\'s Bush.');
			return;
		}
		if (channel === null) {
			channel = message.channel;
		}
	}
}
