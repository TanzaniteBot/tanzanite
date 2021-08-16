import { BushArgumentTypeCaster, BushMessage } from '@lib';

export const contentWithDurationTypeCaster: BushArgumentTypeCaster = async (
	_message: BushMessage,
	phrase: string
): Promise<{ duration: number; contentWithoutTime: string }> => {
	return client.util.parseDuration(phrase);
};
