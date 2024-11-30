import { Arg, BotCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import type { DiceExpression } from '#lib/dice/diceExpression.js';
import { evaluateDiceExpressionWorker, parseDiceNotation } from '#lib/dice/evalDice.js';
import { Flag, FlagType, type ArgumentGeneratorReturn } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType } from 'discord.js';

const COMMON = [2, 4, 6, 8, 10, 12, 20, 100];

export default class DiceRollCommand extends BotCommand {
	public constructor() {
		super('dice-roll', {
			aliases: ['roll', 'rd', 'r', 'dice', 'die', 'd', ...COMMON.map((n) => `d${n}`)],
			category: 'fun',
			description: 'Roll virtual dice.',
			usage: ['roll|rd|r <notation>', 'dice|dice|die|d <sides>', `d{${COMMON}}`],
			examples: ['roll 2d10 + 5', 'r 3d20 - 4', 'rd 4 * d20', 'dice 6', 'd 36', 'd20'],
			helpArgs: [
				{
					name: 'notation',
					description: 'The dice notation to evaluate.',
					type: 'diceNotation',
					optional: false
				}
			],
			slashOptions: [
				{
					name: 'notation',
					description: 'What dice notation would you like evaluated?',
					type: ApplicationCommandOptionType.String
				}
			],
			clientPermissions: [],
			userPermissions: [],
			slash: true,
			flags: ['--override'],
			lock: 'user'
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		/* eslint-disable @typescript-eslint/no-unsafe-assignment */

		const alias = message.util.parsed?.alias ?? '';

		let notation;

		const match = /^d(\d+)$/.exec(alias);
		if (match != null && match[1]) {
			notation = parseDiceNotation(`1d${match[1]}`);
		} else if (['dice', 'die', 'd'].includes(alias)) {
			const num = yield {
				type: (_, p) => {
					if (!p || isNaN(+p)) return null;
					const n = BigInt(p);
					if (n <= 1n) return null;
					return n;
				},
				prompt: {
					start: 'Choose a number of sides for the dice, greater than 1',
					retry: `${emojis.error} A dice must have a number of sides greater than 1`
				}
			};

			notation = parseDiceNotation(`1d${num}`);
		} else {
			notation = yield {
				description: 'The dice notation to evaluate.',
				type: 'diceNotation',
				match: 'rest',
				prompt: {
					start: 'What dice notation would you like evaluated?',
					retry: (_, data) => `{error} Invalid dice notation${data.failure ? `: ${data.failure.value}` : ''}`,
					optional: false
				}
			};
		}

		const override = message.author.isOwner()
			? yield {
					flag: '--override',
					match: 'flag',
					prompt: {
						optional: true
					}
				}
			: undefined;

		return { notation, override };
		/* eslint-enable @typescript-eslint/no-unsafe-assignment */
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { notation: ArgType<'diceNotation'> | string; override: ArgType<'flag'> }
	) {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		if (typeof args.notation === 'string') {
			const cast: DiceExpression | null | Flag<FlagType.Fail> = await Arg.cast('diceNotation', message, args.notation);
			if (cast == null || cast instanceof Flag) {
				return message.util.reply(`${emojis.error} Invalid dice notation${cast?.value ? `: ${cast.value}` : ''}`);
			}
			args.notation = cast;
		}

		let total, hist;
		try {
			[total, hist] = await evaluateDiceExpressionWorker(args.notation, args.override === true && message.author.isOwner());
		} catch (e) {
			return await message.util.reply(`${emojis.error} ${e}`);
		}

		return await message.util.reply(`You rolled a **${total}** ⮜ ${hist}`);
	}
}
