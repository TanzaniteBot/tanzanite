import { type BushArgumentTypeCaster } from '#lib';
import { Permissions, type PermissionString } from 'discord.js';

export const permission: BushArgumentTypeCaster<PermissionString | null> = (_, phrase) => {
	if (!phrase) return null;
	phrase = phrase.toUpperCase().replace(/ /g, '_');
	if (!(phrase in Permissions.FLAGS)) {
		return null;
	} else {
		return phrase as PermissionString;
	}
};
