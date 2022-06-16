import { BushInhibitor, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGlobalBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGlobalBlacklist', {
			reason: 'userGlobalBlacklist',
			category: 'blacklist',
			type: 'pre',
			priority: 30
		});
	}

	public exec(message: CommandMessage | SlashMessage): boolean {
		if (!message.author) return false;
		// do not change to message.author.isOwner()
		if (client.isOwner(message.author) || client.user!.id === message.author.id) return false;
		if (client.cache.global.blacklistedUsers.includes(message.author.id)) {
			void client.console.verbose(
				'userGlobalBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${
					message.inGuild() ? message.guild?.name : message.author.tag
				}>>.`
			);
			return true;
		}
		return false;
	}
}
