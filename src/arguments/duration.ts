import { type BushArgumentTypeCaster } from '#lib';

export const duration: BushArgumentTypeCaster<number | null> = (_, phrase) => {
	return client.util.parseDuration(phrase).duration;
};
