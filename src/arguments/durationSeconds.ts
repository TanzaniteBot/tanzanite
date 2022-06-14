import type { BushArgumentTypeCaster } from '#lib';

export const durationSeconds: BushArgumentTypeCaster<number | null> = (_, phrase) => {
	phrase += 's';
	return client.util.parseDuration(phrase).duration;
};
