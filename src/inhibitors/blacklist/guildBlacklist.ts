import { BotInhibitor, InhibitorReason, InhibitorType, type CommandMessage, type SlashMessage } from '#lib';

export default class GuildBlacklistInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.GuildBlacklist, {
			reason: InhibitorReason.GuildBlacklist,
			type: InhibitorType.All,
			priority: 50
		});
	}

	public exec(message: CommandMessage | SlashMessage): boolean {
		if (message.author == null || !message.inGuild()) return false;
		//! do not change to message.author.isOwner()
		if (
			this.client.isOwner(message.author) ||
			this.client.isSuperUser(message.author) ||
			this.client.user!.id === message.author.id
		)
			return false;
		if (this.client.cache.global.blacklistedGuilds.includes(message.guild.id)) {
			void this.client.console.verbose(
				InhibitorReason.GuildBlacklist,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
