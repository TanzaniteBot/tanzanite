import { parseDuration, type BotArgumentTypeCaster, type ParsedDuration } from '#lib';

export const contentWithDuration: BotArgumentTypeCaster<ParsedDuration> = (_, phrase) => {
	return parseDuration(phrase);
};
