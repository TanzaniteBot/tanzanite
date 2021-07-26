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
		if (this.client.isOwner(message.author)) return false;
		for (const property in this.client.cache.global) {
			if (!this.client.cache.global[property]) {
				this.client.console.debug(`NoCacheInhibitor blocked message.`);
				return true;
			}
		}
		return false;
	}
}
