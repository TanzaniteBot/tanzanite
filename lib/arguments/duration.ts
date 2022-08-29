import { parseDuration, type BotArgumentTypeCaster } from '#lib';

export const duration: BotArgumentTypeCaster<number | null> = (_, phrase) => {
	return parseDuration(phrase).duration;
};
