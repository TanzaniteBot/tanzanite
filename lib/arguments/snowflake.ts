import { regex, type BotArgumentTypeCaster } from '#lib';
import type { Snowflake } from 'discord.js';

export const snowflake: BotArgumentTypeCaster<Snowflake | null> = (_, phrase) => {
	if (!phrase) return null;
	if (regex.snowflake.test(phrase)) return phrase;
	return null;
};
