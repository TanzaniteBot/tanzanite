import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message } from 'discord.js';

export default class PurgeCommand extends BotCommand {
	public constructor() {
		super('Purge', {
			aliases: ['Purge'],
			category: 'moderation',
			description: {
				content: 'A command to mass delete amount.',
				usage: 'Purge <amount>',
				examples: ['Purge 20']
			},
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				//TODO: Add more arguments
				{
					id: 'amount',
					type: 'number',
					prompt: {
						start: 'How many messages would you like to purge?',
						retry: '<:no:787549684196704257> Please pick a valid amount of messages to purge.'
					}
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { amount }: { amount: number }): Promise<void> {
		if (amount > 100) amount = 100;
		if (message.channel.type === 'dm') return;
		await message.channel.bulkDelete(amount, true).catch(() => {
			message.reply('<:no:787549684196704257> Failed to purge messages.');
		});
	}
}
