import { Arg, BotCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import type { DiceExpression } from '#lib/dice/diceExpression.js';
import { evaluateDiceExpression } from '#lib/dice/evalDice.js';
import { Flag, FlagType } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType } from 'discord.js';

const COMMON = [4, 6, 8, 12, 20];

export default class DiceRollCommand extends BotCommand {
	public constructor() {
		super('dice-roll', {
			aliases: ['roll', 'dice', 'die', 'rd', 'd', ...COMMON.map((n) => `d${n}`)],
			category: 'fun',
			description: 'Roll virtual dice.',
			usage: ['roll', 'roll [sides]'],
			examples: ['roll'],
			args: [
				{
					id: 'notation',
					description: 'The dice notation to evaluate.',
					type: 'diceNotation',
					match: 'rest',
					prompt: 'What dice notation would you like evaluated?',
					retry: (_, data) => `{error} Invalid dice notation${data.failure ? `: ${data.failure.value}` : ''}`,
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'override',
					description: 'Override limitations.',
					flag: '--override',
					match: 'flag',
					optional: true,
					slashType: false,
					only: 'text',
					ownerOnly: true
				}
			],
			clientPermissions: [],
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { notation: ArgType<'diceNotation'> | string; override: ArgType<'flag'> }
	) {
		if (typeof args.notation === 'string') {
			const cast: DiceExpression | null | Flag<FlagType.Fail> = await Arg.cast('diceNotation', message, args.notation);
			if (cast == null || cast instanceof Flag) {
				return message.util.reply(`${emojis.error} Invalid dice notation${cast?.value ? `: ${cast.value}` : ''}`);
			}
			args.notation = cast;
		}

		let total, hist;
		try {
			[total, hist] = evaluateDiceExpression(args.notation, args.override === true && message.author.isOwner());
		} catch (e) {
			return await message.util.reply(`${emojis.error} ${e}`);
		}

		return await message.util.reply(`You rolled a **${total}** ⮜ ${hist}`);
	}
}
