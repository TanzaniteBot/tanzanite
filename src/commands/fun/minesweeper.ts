import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { Minesweeper } from '@notenoughupdates/discord.js-minesweeper';
import assert from 'assert';
assert(Minesweeper);

export default class MinesweeperCommand extends BushCommand {
	public constructor() {
		super('minesweeper', {
			aliases: ['minesweeper'],
			category: 'fun',
			description: 'minesweeper command.',
			usage: ['minesweeper <rows> <columns> <mines> [--spaces] [--revealFirstCell]'],
			examples: ['minesweeper 10 10 2'],
			args: [
				{
					id: 'rows',
					description: 'The number of rows to generate.',
					type: 'integer',
					prompt: 'How many rows would you like?',
					retry: '{error} Choose a valid number of rows',
					optional: true,
					default: 9,
					slashType: 'INTEGER'
				},
				{
					id: 'columns',
					description: 'The number of columns to generate.',
					type: 'integer',
					prompt: 'How many columns would you like?',
					retry: '{error} Choose a valid number of columns',
					optional: true,
					default: 9,
					slashType: 'INTEGER'
				},
				{
					id: 'mines',
					description: 'The number of mines to generate.',
					type: 'integer',
					prompt: 'How many mines would you like?',
					retry: '{error} Choose a valid number of mines',
					optional: true,
					default: 10,
					slashType: 'INTEGER'
				},
				{
					id: 'spaces',
					description: 'Whether or not to put a space between cells.',
					match: 'flag',
					flag: '--spaces',
					prompt: 'Would you like there to be spaces?',
					slashType: 'BOOLEAN',
					optional: true
				},
				{
					id: 'reveal_first_cell',
					description: 'Whether or not to reveal the first cell automatically.',
					match: 'flag',
					flag: '--revealFirstCell',
					prompt: 'Would you like to automatically reveal the first cell?',
					slashType: 'BOOLEAN',
					optional: true
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			rows: ArgType<'integer'>;
			columns: ArgType<'integer'>;
			mines: ArgType<'integer'>;
			spaces: boolean;
			reveal_first_cell: boolean;
		}
	) {
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
