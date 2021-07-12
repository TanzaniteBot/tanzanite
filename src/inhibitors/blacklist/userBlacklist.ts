import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class UserBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userBlacklist', {
			reason: 'userBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.author) return false;
		if (this.client.isOwner(message.author) || this.client.isSuperUser(message.author)) return false;
		if (this.client.cache.global.blacklistedUsers.includes(message.author.id)) {
			this.client.console.debug(`UserBlacklistInhibitor blocked message.`);
			return true;
		}
	}
}
