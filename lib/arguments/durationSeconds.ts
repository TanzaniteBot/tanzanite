import { parseDuration, type BotArgumentTypeCaster } from '#lib';

export const durationSeconds: BotArgumentTypeCaster<number | null> = (_, phrase) => {
	phrase += 's';
	return parseDuration(phrase).duration;
};
