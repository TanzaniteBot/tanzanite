import { ParsedDuration, type BushArgumentTypeCaster } from '#lib';

export const contentWithDuration: BushArgumentTypeCaster = async (_, phrase): Promise<ParsedDuration> => {
	return client.util.parseDuration(phrase);
};
