import { BushArgumentTypeCaster } from '@lib';
import { Snowflake } from 'discord.js';

export const snowflakeTypeCaster: BushArgumentTypeCaster = (_, phrase): Snowflake | null => {
	if (!phrase) return null;
	if (client.consts.regex.snowflake.test(phrase)) return phrase;
	return null;
};
