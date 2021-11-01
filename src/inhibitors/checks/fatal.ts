import { BushInhibitor, type BushMessage, type BushSlashMessage } from '@lib';

export default class FatalInhibitor extends BushInhibitor {
	public constructor() {
		super('fatal', {
			reason: 'fatal',
			type: 'all',
			category: 'checks',
			priority: 100
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (client.isOwner(message.author)) return false;
		for (const property in client.cache.global) {
			if (!client.cache.global[property as keyof typeof client.cache.global]) {
				return true;
			}
		}
		return false;
	}
}
