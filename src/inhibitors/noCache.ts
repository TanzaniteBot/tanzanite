import { BushInhibitor } from '../lib/extensions/discord-akairo/BushInhibitor';
import { BushSlashMessage } from '../lib/extensions/discord-akairo/BushSlashMessage';
import { BushMessage } from '../lib/extensions/discord.js/BushMessage';

export default class noCacheInhibitor extends BushInhibitor {
	constructor() {
		super('noCache', {
			reason: 'noCache',
			type: 'all',
			priority: 100
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (this.client.isOwner(message.author)) return false;
		for (const property in this.client.cache) {
			if (property === undefined || property === null) return true;
		}
		return false;
	}
}
