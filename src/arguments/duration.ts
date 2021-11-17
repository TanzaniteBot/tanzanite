import { type BushArgumentTypeCaster } from '#lib';

export const duration: BushArgumentTypeCaster = (_, phrase): number | null => {
	return client.util.parseDuration(phrase).duration;
};
