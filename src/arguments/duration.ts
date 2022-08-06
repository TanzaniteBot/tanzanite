import { parseDuration, type BushArgumentTypeCaster } from '#lib';

export const duration: BushArgumentTypeCaster<number | null> = (_, phrase) => {
	return parseDuration(phrase).duration;
};
