import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class UserGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGuildBlacklist', {
			reason: 'userGuildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (
			this.client.isOwner(message.author) ||
			this.client.isSuperUser(message.author) ||
			this.client.user.id === message.author.id
		)
			return false;
		if ((await message.guild.getSetting('blacklistedUsers'))?.includes(message.author.id)) {
			this.client.console.debug(`userGuildBlacklist blocked message.`);
			return true;
		}
	}
}
