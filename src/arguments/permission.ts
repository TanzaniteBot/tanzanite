import { type BushArgumentTypeCaster } from '#lib';
import { Permissions, PermissionString } from 'discord.js';

export const permission: BushArgumentTypeCaster = (_, phrase): PermissionString | null => {
	if (!phrase) return null;
	phrase = phrase.toUpperCase().replace(/ /g, '_');
	if (!(phrase in Permissions.FLAGS)) {
		return null;
	} else {
		return phrase as PermissionString;
	}
};
