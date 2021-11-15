import { type BushArgumentTypeCaster } from '#lib';
import { type Snowflake } from 'discord-api-types';

export const discordEmoji: BushArgumentTypeCaster = (_, phrase): { name: string; id: Snowflake } | null => {
	if (!phrase) return null;
	const validEmoji: RegExpExecArray | null = client.consts.regex.discordEmoji.exec(phrase);
	if (!validEmoji || !validEmoji.groups) return null;
	return { name: validEmoji.groups.name, id: validEmoji.groups.id };
};
