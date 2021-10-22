import { Permissions } from 'discord.js';
import { BushArgumentTypeCaster } from '../lib/extensions/discord-akairo/BushArgumentTypeCaster';

export const permissionTypeCaster: BushArgumentTypeCaster = (_, phrase) => {
	if (!phrase) return null;
	phrase = phrase.toUpperCase().replace(/ /g, '_');
	if (!Reflect.has(Permissions.FLAGS, phrase)) {
		return null;
	} else {
		return phrase;
	}
};
