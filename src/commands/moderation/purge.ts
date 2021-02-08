import { BotCommand } from '../../extensions/BotCommand';
import { Message} from 'discord.js';

export default class PurgeCommand extends BotCommand {
	public constructor() {
		super('Purge', {
			aliases: ['Purge'],
			category: 'moderation',
			description: {
				content: 'A command to mass delete messages.',
				usage: 'Purge <messages>',
				examples: ['Purge 20'],
			},
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [ //I will add more arguments later
				{
					id: 'messages',
					type: 'number',
				},
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { messages }: {messages: number}): Promise<void> {
		if(messages > 100)
			messages = 100
		if (message.channel.type === 'dm') return
		await message.channel.bulkDelete(messages)
	}
}
