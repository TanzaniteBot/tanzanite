import { BushArgumentTypeCaster } from '@lib';
import numeral = require('numeral');

export const abbreviatedNumberTypeCaster: BushArgumentTypeCaster = (_, phrase): number | null => {
	if (!phrase) return null;
	const num = numeral(phrase?.toLowerCase()).value();

	if (num === undefined || num === null || isNaN(num)) return null;

	return num;
};
