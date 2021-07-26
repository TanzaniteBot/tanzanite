import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class NoCacheInhibitor extends BushInhibitor {
	public constructor() {
		super('noCache', {
			reason: 'noCache',
			type: 'all',
			priority: 100
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (client.isOwner(message.author)) return false;
		for (const property in client.cache.global) {
			if (!client.cache.global[property]) {
				client.console.debug(`NoCacheInhibitor blocked message.`);
				return true;
			}
		}
		return false;
	}
}
