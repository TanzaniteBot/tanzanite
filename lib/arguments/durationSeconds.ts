import { parseDuration, type BushArgumentTypeCaster } from '#lib';

export const durationSeconds: BushArgumentTypeCaster<number | null> = (_, phrase) => {
	phrase += 's';
	return parseDuration(phrase).duration;
};
