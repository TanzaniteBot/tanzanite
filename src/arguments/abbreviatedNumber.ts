import { type BushArgumentTypeCaster } from '#lib';
import numeral from 'numeral';

export const abbreviatedNumber: BushArgumentTypeCaster = (_, phrase): number | null => {
	if (!phrase) return null;
	const num = numeral(phrase?.toLowerCase()).value();

	if (num === undefined || num === null || isNaN(num)) return null;

	return num;
};
