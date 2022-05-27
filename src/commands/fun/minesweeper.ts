import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { Minesweeper } from '@notenoughupdates/discord.js-minesweeper';
import assert from 'assert';
import { ApplicationCommandOptionType } from 'discord.js';
assert(Minesweeper);

export default class MinesweeperCommand extends BushCommand {
	public constructor() {
		super('minesweeper', {
			aliases: ['minesweeper'],
			category: 'fun',
			description: 'minesweeper command.',
			usage: ['minesweeper <rows> <columns> <mines> [--spaces] [--doNotRevealFirstCell]'],
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
					slashType: ApplicationCommandOptionType.Integer
				},
				{
					id: 'columns',
					description: 'The number of columns to generate.',
					type: 'integer',
					prompt: 'How many columns would you like?',
					retry: '{error} Choose a valid number of columns',
					optional: true,
					default: 9,
					slashType: ApplicationCommandOptionType.Integer
				},
				{
					id: 'mines',
					description: 'The number of mines to generate.',
					type: 'integer',
					prompt: 'How many mines would you like?',
					retry: '{error} Choose a valid number of mines',
					optional: true,
					default: 10,
					slashType: ApplicationCommandOptionType.Integer
				},
				{
					id: 'spaces',
					description: 'Whether or not to put a space between cells.',
					match: 'flag',
					flag: '--spaces',
					prompt: 'Would you like there to be spaces?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'do_not_reveal_first_cell',
					description: 'Whether to not reveal the first cell automatically.',
					match: 'flag',
					flag: ['--doNotRevealFirstCell', 'do_not_reveal_first_cell'],
					prompt: 'Would you like to not automatically reveal the first cell?',
					slashType: ApplicationCommandOptionType.Boolean,
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
			do_not_reveal_first_cell: boolean;
		}
	) {
		const minesweeper = new Minesweeper({
			rows: args.rows,
			columns: args.columns,
			mines: args.mines,
			revealFirstCell: args.do_not_reveal_first_cell ? false : true,
			spaces: args.spaces ?? false,
			zeroFirstCell: false
		});

		const matrix = minesweeper.start();

		if (args.rows * args.columns <= args.mines * 2)
			return message.util.reply(
				`${util.emojis.error} The number of roles multiplied by the number of columns must be greater than or equal to the number of mines multiplied by two.`
			);

		if (!matrix) return await message.util.reply(`${util.emojis.error} Something went wrong.`);

		const res = matrix.toString().replaceAll(':zero:', ':blue_square:');

		if (res.length > 2000) return message.util.reply(`${util.emojis.error} The minesweeper generated is over 2,000 characters.`);

		return await message.util.reply(res);
	}
}
