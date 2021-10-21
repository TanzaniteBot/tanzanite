import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import Minesweeper from 'discord.js-minesweeper';

export default class MinesweeperCommand extends BushCommand {
	public constructor() {
		super('minesweeper', {
			aliases: ['minesweeper'],
			category: 'fun',
			description: {
				content: 'minesweeper command.',
				usage: 'minesweeper <rows> <columns> <mines> [--spaces] [--revealFirstCell]',
				examples: ['minesweeper 10 10 2']
			},
			args: [
				{
					id: 'rows',
					type: 'integer',
					prompt: {
						start: 'How many rows would you like?',
						retry: '{error} Choose a valid number of rows',
						optional: true
					},
					default: 9
				},
				{
					id: 'columns',
					type: 'integer',
					prompt: {
						start: 'How many columns would you like?',
						retry: '{error} Choose a valid number of columns',
						optional: true
					},
					default: 9
				},
				{
					id: 'mines',
					type: 'integer',
					prompt: {
						start: 'How many mines would you like?',
						retry: '{error} Choose a valid number of mines',
						optional: true
					},
					default: 10
				},
				{ id: 'spaces', match: 'flag', flag: '--spaces' },
				{ id: 'reveal_first_cell', match: 'flag', flag: '--revealFirstCell' }
			],
			slash: true,
			slashOptions: [
				{ name: 'rows', description: 'How many rows would you like?', type: 'INTEGER', required: false },
				{ name: 'columns', description: 'How many rows would you like?', type: 'INTEGER', required: false },
				{ name: 'mines', description: 'How many rows would you like?', type: 'INTEGER', required: false },
				{ name: 'spaces', description: 'Would you like there to be spaces?', type: 'BOOLEAN', required: false },
				{
					name: 'reveal_first_cell',
					description: 'Would you like to automatically reveal the first cell?',
					type: 'BOOLEAN',
					required: false
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { rows: number; columns: number; mines: number; spaces: boolean; reveal_first_cell: boolean }
	): Promise<unknown> {
		const minesweeper = new Minesweeper({
			rows: args.rows ?? 9,
			columns: args.columns ?? 9,
			mines: args.mines ?? 10,
			emote: 'boom',
			revealFirstCell: args.reveal_first_cell ?? false,
			zeroFirstCell: true,
			spaces: args.spaces ?? false,
			returnType: 'emoji'
		});
		const matrix = minesweeper.start();
		return await message.util.reply(matrix?.toString() ?? `${util.emojis.error} Something went wrong.`);
	}
}
