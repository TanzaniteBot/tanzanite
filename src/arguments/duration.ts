import { BushArgumentTypeCaster, BushMessage } from '@lib';

export const durationTypeCaster: BushArgumentTypeCaster = (_message: BushMessage, phrase): number => {
	return client.util.parseDuration(phrase).duration;
};
