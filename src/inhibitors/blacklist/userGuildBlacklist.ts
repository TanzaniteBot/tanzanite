import { BotInhibitor, InhibitorReason, InhibitorType, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGuildBlacklistInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.UserGuildBlacklist, {
			reason: InhibitorReason.UserGuildBlacklist,
			type: InhibitorType.Pre,
			priority: 20
		});
	}

	public async exec(message: CommandMessage | SlashMessage): Promise<boolean> {
		if (message.author == null || !message.inGuild()) return false;
		//! do not change to message.author.isOwner()
		if (
			this.client.isOwner(message.author) ||
			this.client.isSuperUser(message.author) ||
			this.client.user!.id === message.author.id
		)
			return false;
		if ((await message.guild.getSetting('blacklistedUsers'))?.includes(message.author.id)) {
			void this.client.console.verbose(
				InhibitorReason.UserGuildBlacklist,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
