import {
	BotCommand,
	clientSendAndPermCheck,
	emojis,
	OptArgType,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { Minesweeper } from '@notenoughupdates/discord.js-minesweeper';
import assert from 'assert/strict';
import { ApplicationCommandOptionType } from 'discord.js';
assert(Minesweeper);

export default class MinesweeperCommand extends BotCommand {
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
					id: 'no_reveal',
					description: 'Whether to not reveal the first cell automatically.',
					match: 'flag',
					flag: ['--noReveal', '--no_reveal', '--doNotRevealFirstCell', 'do_not_reveal_first_cell'],
					prompt: 'Would you like to not automatically reveal the first cell?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			rows: OptArgType<'integer'>;
			columns: OptArgType<'integer'>;
			mines: OptArgType<'integer'>;
			spaces: ArgType<'flag'>;
			no_reveal: ArgType<'flag'>;
		}
	) {
		args.rows ??= 9;
		args.columns ??= 9;
		args.mines ??= 10;

		const minesweeper = new Minesweeper({
			rows: args.rows,
			columns: args.columns,
			mines: args.mines,
			revealFirstCell: args.no_reveal ? false : true,
			spaces: args.spaces ?? false,
			zeroFirstCell: false
		});

		const matrix = minesweeper.start();

		if (args.rows * args.columns <= args.mines * 2)
			return message.util.reply(
				`${emojis.error} The number of roles multiplied by the number of columns must be greater than or equal to the number of mines multiplied by two.`
			);

		if (!matrix) return await message.util.reply(`${emojis.error} Something went wrong.`);

		const res = matrix.toString().replaceAll(':zero:', ':blue_square:');

		if (res.length > 2000) return message.util.reply(`${emojis.error} The minesweeper generated is over 2,000 characters.`);

		return await message.util.reply(res);
	}
}
