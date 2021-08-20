import { BushArgumentTypeCaster } from '@lib';

export const durationTypeCaster: BushArgumentTypeCaster = (_, phrase): number => {
	return client.util.parseDuration(phrase).duration;
};
