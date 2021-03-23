import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class PurgeCommand extends BushCommand {
	public constructor() {
		super('Purge', {
			aliases: ['Purge'],
			category: 'moderation',
			description: {
				content: 'A command to mass delete amount.',
				usage: 'Purge <amount>',
				examples: ['Purge 20']
			},
			clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				//TODO: Add more arguments
				{
					id: 'amount',
					type: Argument.range('integer', 1, 100, true),
					prompt: {
						start: 'How many messages would you like to purge?',
						retry: '<:no:787549684196704257> Please pick a number between 1 and 100.'
					}
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { amount }: { amount: number }): Promise<void> {
		if (message.channel.type === 'dm') return;
		await message.channel.bulkDelete(amount, true).catch(() => {
			message.reply('<:no:787549684196704257> Failed to purge messages.');
		});
	}
}
