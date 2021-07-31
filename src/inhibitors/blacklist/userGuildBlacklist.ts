import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class UserGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGuildBlacklist', {
			reason: 'userGuildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user.id === message.author.id)
			return false;
		if ((await message.guild.getSetting('blacklistedUsers'))?.includes(message.author.id)) {
			// client.console.debug(`userGuildBlacklist blocked message.`);
			return true;
		}
	}
}
