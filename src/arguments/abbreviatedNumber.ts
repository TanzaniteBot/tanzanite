import type { BushArgumentTypeCaster } from '#lib';
import assert from 'assert';
import numeral from 'numeral';
assert(typeof numeral === 'function');

export const abbreviatedNumber: BushArgumentTypeCaster<number | null> = (_, phrase) => {
	if (!phrase) return null;
	const num = numeral(phrase?.toLowerCase()).value();

	if (typeof num !== 'number' || isNaN(num)) return null;

	return num;
};
