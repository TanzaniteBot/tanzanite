import { BotCommand } from '../../extensions/BotCommand';
import { Message} from 'discord.js';
import Minesweeper from 'discord.js-minesweeper';

export default class MineSweeperCommand extends BotCommand {
	public constructor() {
		super('minesweeper', {
			aliases: ['minesweeper'],
			category: 'fun',
			description: {
				content: 'minesweeper command.',
				usage: 'minesweeper <rows> <columns> <mines> [--spaces] [--revealFirstCell]',
				examples: ['minesweeper 10 10 2'],
			},
			args: [
				{
					id: 'rows',
					type: 'integer',
					match: 'content',
					prompt: {
						start: 'How many rows would you like?',
						optional: true,
					},
					default: 9,
				},
				{
					id: 'columns',
					type: 'integer',
					match: 'content',
					prompt: {
						start: 'How many columns would you like?',
						optional: true,
					},
					default: 9,
				},
				{
					id: 'mines',
					type: 'integer',
					match: 'content',
					prompt: {
						start: 'How many mines would you like?',
						optional: true,
					},
					default: 10,
				},
				{
					id: 'spaces',
					match: 'flag',
					flag: '--spaces',
				},
				{
					id: 'revealFirstCell',
					match: 'flag',
					flag: '--revealFirstCell',
				},
			],
		});
	}
	public async exec(message: Message, { rows, columns, mines, spaces, revealFirstCell }: { rows: number, columns:number, mines:number, spaces: boolean, revealFirstCell:boolean }): Promise<Message> {
		
		const minesweeper = new Minesweeper({
			rows: rows,
			columns: columns,
			mines: mines,
			emote: 'boom',
			revealFirstCell: revealFirstCell,
			zeroFirstCell: true,
			spaces: spaces,
			returnType: 'emoji'
		});
		const matrix = minesweeper.start();
		return message.util.send(matrix)
	}
}