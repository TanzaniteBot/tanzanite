import { type BushArgumentTypeCaster, type ParsedDuration } from '#lib';

export const contentWithDuration: BushArgumentTypeCaster<Promise<ParsedDuration>> = async (_, phrase) => {
	return client.util.parseDuration(phrase);
};
