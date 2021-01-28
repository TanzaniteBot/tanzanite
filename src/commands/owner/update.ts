import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';

export default class Test2Command extends BotCommand {
	public constructor() {
		super('update', {
			aliases: ['update'],
			category: 'owner',
			description: {
				content: 'git pulls from the repo then recompiles the bot',
				usage: 'update',
				examples: ['update'],
			},
			ownerOnly: true,
		});
	}
	public async exec(message: Message): Promise<void> {
		await message.channel.send('Not done because TrashCan can\'t code.');
	}
}
