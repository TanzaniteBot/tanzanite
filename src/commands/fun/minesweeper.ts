import { BotCommand } from '../../extensions/BotCommand';
import { Message} from 'discord.js';

export default class EightBallCommand extends BotCommand {
	public constructor() {
		super('minesweeper', {
			aliases: ['minesweeper'],
			category: 'fun',
			description: {
				content: 'Minesweeper command.',
				usage: 'Minesweeper <question>',
				examples: ['Minesweeper '],
			},
			args: [
				{
					id: 'a',
					type: 'string',
					prompt: {
						start: 'a',
					},
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, { a }: { a: string }): Promise<void> {
		//
	}
}
