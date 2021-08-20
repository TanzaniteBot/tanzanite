import { Snowflake } from 'discord-api-types';
import { BushArgumentTypeCaster } from '../lib';

export const discordEmojiTypeCaster: BushArgumentTypeCaster = (
	_,
	phrase
): { name: string; id: Snowflake; animated: boolean } | null => {
	console.log(phrase);
	if (!phrase) return null;
	const validEmoji = client.consts.regex.discordEmoji.test(phrase);
	console.log(validEmoji);
	if (!validEmoji) return null;
	const emoji = phrase.replace(/[<>]/g, '').split(':');
	const animated = emoji[0] === 'a';
	console.log(emoji);
	return { name: emoji[1], id: emoji[2], animated };
};
