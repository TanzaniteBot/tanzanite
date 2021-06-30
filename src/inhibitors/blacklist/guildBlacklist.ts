import { BushInhibitor } from '../../lib/extensions/discord-akairo/BushInhibitor';
import { BushSlashMessage } from '../../lib/extensions/discord-akairo/BushSlashMessage';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';

export default class GuildBlacklistInhibitor extends BushInhibitor {
	constructor() {
		super('guildBlacklist', {
			reason: 'guildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.guild) return false;
		if (message.author && (this.client.isOwner(message.author) || this.client.isSuperUser(message.author))) return false;
		return this.client.cache.global.blacklistedGuilds.includes(message.guild.id);
	}
}
