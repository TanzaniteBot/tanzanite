import { BushInhibitor, type BushMessage, type BushSlashMessage } from '@lib';

export default class UserGlobalBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGlobalBlacklist', {
			reason: 'userGlobalBlacklist',
			category: 'blacklist',
			type: 'pre',
			priority: 30
		});
	}

	public override exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.author) return false;
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user!.id === message.author.id)
			return false;
		if (client.cache.global.blacklistedUsers.includes(message.author.id)) {
			return true;
		}
		return false;
	}
}
