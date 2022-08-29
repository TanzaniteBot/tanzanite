import type { BotArgumentTypeCaster } from '#lib';
import assert from 'assert/strict';
import numeral from 'numeral';
assert(typeof numeral === 'function');

export const abbreviatedNumber: BotArgumentTypeCaster<number | null> = (_, phrase) => {
	if (!phrase) return null;
	const num = numeral(phrase?.toLowerCase()).value();

	if (typeof num !== 'number' || isNaN(num)) return null;

	return num;
};
