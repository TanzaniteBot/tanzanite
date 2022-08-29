import type { BotArgumentTypeCaster } from '#lib';
import { PermissionFlagsBits, type PermissionsString } from 'discord.js';

export const permission: BotArgumentTypeCaster<PermissionsString | null> = (_, phrase) => {
	if (!phrase) return null;
	phrase = phrase.toUpperCase().replace(/ /g, '_');
	if (!(phrase in PermissionFlagsBits)) {
		return null;
	} else {
		return phrase as PermissionsString;
	}
};
