import { type BushArgumentTypeCaster } from '@lib';

export const durationSecondsTypeCaster: BushArgumentTypeCaster = (_, phrase): number | null => {
	phrase += 's';
	return client.util.parseDuration(phrase).duration;
};
