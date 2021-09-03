import { BushArgumentTypeCaster } from '@lib';
import numeral = require('numeral');

export const abbreviatedNumberTypeCaster: BushArgumentTypeCaster = (_, phrase): number | null => {
	return numeral(phrase?.toLowerCase()).value();
};
