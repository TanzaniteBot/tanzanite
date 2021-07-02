import { BushArgumentTypeCaster } from '../lib/extensions/discord-akairo/BushArgumentTypeCaster';
import { BushMessage } from '../lib/extensions/discord.js/BushMessage';

export const contentWithDurationTypeCaster: BushArgumentTypeCaster = async (
	_message: BushMessage,
	phrase
): Promise<{ duration: number; contentWithoutTime: string }> => {
	return client.util.parseDuration(phrase);
};
