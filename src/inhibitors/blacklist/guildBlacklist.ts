import { BushInhibitor, BushMessage, BushSlashMessage } from '../../lib';

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
		if (message.author && (this.client.isOwner(message.author) || this.client.isSuperUser(message.author))) return false;
		if (this.client.cache.global.blacklistedGuilds.includes(message.guild.id)) {
			this.client.console.debug(`GuildBlacklistInhibitor blocked message.`);
			return true;
		}
	}
}
