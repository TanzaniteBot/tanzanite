import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, TextChannel, NewsChannel, Role } from 'discord.js';

export default class LockDownCommand extends BushCommand {
	public constructor() {
		super('Lockdown', {
			aliases: ['Lockdown', 'Unlockdown'],
			category: "Moulberry's Bush",
			description: {
				content:
					'A command to quickly prevent certain roles from talking in channels.',
				usage: 'Lockdown [channel] ',
				examples: ['Lockdown #general']
			},
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel would you like to lockdown?',
						retry:
							'<:no:787549684196704257> choose a valid channel to lockdown',
						optional: true
					},
					default: m => m.channel
				},
				{
					id: 'allowedRoles',
					type: 'roles'
				}
			],
			channel: 'guild',
			hidden: true
		});
	}
	public exec(
		message: Message,
		{
			channel,
			allowedRoles
		}: { channel: TextChannel | NewsChannel; allowedRoles: Role[] }
	): Promise<Message> {
		if (message.channel.type === 'dm')
			return message.util.reply(
				'<:no:787549684196704257> This command cannot be run in DMs.'
			);
		if (message.channel.guild.id !== '516977525906341928')
			return message.util.reply(
				"<:no:787549684196704257> This command can only be run in Moulberry's Bush."
			);
		return message.util.reply(
			'<:no:787549684196704257> This command is not finished.'
		);
	}
}
