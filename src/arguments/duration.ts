import { BushArgumentTypeCaster } from '@lib';

export const durationTypeCaster: BushArgumentTypeCaster = (_, phrase): number | null => {
	return client.util.parseDuration(phrase).duration;
};
