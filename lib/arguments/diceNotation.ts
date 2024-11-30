/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { formatList, type BotArgumentTypeCaster } from '#lib';
import type { DiceExpression } from '#lib/dice/diceExpression.js';
import { parseDiceNotation } from '#lib/dice/evalDice.js';
import { Flag, FlagType } from '@tanzanite/discord-akairo';

export const diceNotation: BotArgumentTypeCaster<DiceExpression | Flag<FlagType.Fail> | null> = (_, phrase) => {
	if (!phrase) return null;

	phrase = phrase.replace(/\s+/g, '');

	let res: DiceExpression | null;
	try {
		res = parseDiceNotation(phrase);
	} catch (e) {
		if (!(e instanceof Error) || (e as Record<string, any>)?.token?.value == null) {
			return new Flag(FlagType.Fail, { value: e });
		}

		// adapted from https://stackoverflow.com/a/72016226
		const token: { value: string } = (e as any).token;
		const message = e.message;
		const expected = message.match(/(?<=A ).*(?= based on:)/g)?.map((s) => s.replace(/\s+token/i, '')) ?? [];
		let newMessage = `Unexpected token "${token.value}"`;
		if (expected?.length > 0) newMessage += `; expecting ${formatList([...new Set(expected)], 'or')}`;

		return new Flag(FlagType.Fail, { value: newMessage });
	}

	return res;
};
