import { BushInhibitor, type CommandMessage, type SlashMessage } from '#lib';

export default class GuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('guildBlacklist', {
			reason: 'guildBlacklist',
			category: 'blacklist',
			type: 'all',
			priority: 50
		});
	}

	public exec(message: CommandMessage | SlashMessage): boolean {
		if (!message.author || !message.inGuild()) return false;
		// do not change to message.author.isOwner()
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user!.id === message.author.id)
			return false;
		if (client.cache.global.blacklistedGuilds.includes(message.guild.id)) {
			void client.console.verbose(
				'guildBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
