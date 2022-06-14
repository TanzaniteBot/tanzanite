import type { BushArgumentTypeCaster } from '#lib';
import type { Snowflake } from 'discord.js';

export const snowflake: BushArgumentTypeCaster<Snowflake | null> = (_, phrase) => {
	if (!phrase) return null;
	if (client.consts.regex.snowflake.test(phrase)) return phrase;
	return null;
};
