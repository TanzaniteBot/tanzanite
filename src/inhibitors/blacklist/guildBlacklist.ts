import { BushInhibitor, type BushMessage, type BushSlashMessage } from '#lib';

export default class GuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('guildBlacklist', {
			reason: 'guildBlacklist',
			category: 'blacklist',
			type: 'all',
			priority: 50
		});
	}

	public override exec(message: BushMessage | BushSlashMessage): boolean {
		if (!message.guild) return false;
		if (
			message.author &&
			(client.isOwner(message.author) || client.isSuperUser(message.author) || client.user!.id === message.author.id)
		)
			return false;
		if (client.cache.global.blacklistedGuilds.includes(message.guild.id)) {
			void client.console.verbose('guildBlacklist', `Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`)
			return true;
		}
		return false;
	}
}
