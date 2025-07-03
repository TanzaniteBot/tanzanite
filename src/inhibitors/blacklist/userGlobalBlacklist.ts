import { BotInhibitor, InhibitorReason, InhibitorType, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGlobalBlacklistInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.UserGlobalBlacklist, {
			reason: InhibitorReason.UserGlobalBlacklist,
			type: InhibitorType.Pre,
			priority: 30
		});
	}

	public exec(message: CommandMessage | SlashMessage): boolean {
		if (message.author == null) return false;
		//! do not change to message.author.isOwner()
		if (this.client.isOwner(message.author) || this.client.user!.id === message.author.id) return false;
		if (this.client.cache.global.blacklistedUsers.includes(message.author.id)) {
			void this.client.console.verbose(
				InhibitorReason.UserGlobalBlacklist,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${
					message.inGuild() ? message.guild?.name : message.author.tag
				}>>.`
			);
			return true;
		}
		return false;
	}
}
