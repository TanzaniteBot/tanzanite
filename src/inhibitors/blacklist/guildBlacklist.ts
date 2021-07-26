import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class GuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('guildBlacklist', {
			reason: 'guildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.guild) return false;
		if (
			message.author &&
			(client.isOwner(message.author) || client.isSuperUser(message.author) || client.user.id === message.author.id)
		)
			return false;
		if (client.cache.global.blacklistedGuilds.includes(message.guild.id)) {
			client.console.debug(`GuildBlacklistInhibitor blocked message.`);
			return true;
		}
	}
}
