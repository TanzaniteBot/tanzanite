import { parseDuration, type BotArgumentTypeCaster, type ParsedDuration } from '#lib';

export const contentWithDuration: BotArgumentTypeCaster<Promise<ParsedDuration>> = async (_, phrase) => {
	return parseDuration(phrase);
};
