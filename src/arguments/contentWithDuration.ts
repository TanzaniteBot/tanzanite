import { type BushArgumentTypeCaster } from '#lib';

export const contentWithDurationTypeCaster: BushArgumentTypeCaster = async (
	_,
	phrase
): Promise<{ duration: number | null; contentWithoutTime: string | null }> => {
	return client.util.parseDuration(phrase);
};
