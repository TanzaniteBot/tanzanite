import { type BushArgumentTypeCaster } from '#lib';

export const durationSeconds: BushArgumentTypeCaster = (_, phrase): number | null => {
	phrase += 's';
	return client.util.parseDuration(phrase).duration;
};
