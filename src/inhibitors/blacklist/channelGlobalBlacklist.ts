import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGlobalBlacklistInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.ChannelGlobalBlacklist, {
			reason: InhibitorReason.ChannelGlobalBlacklist,
			type: InhibitorType.Post,
			priority: 500
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (message.author == null || !message.inGuild()) return false;
		//! do not change to message.author.isOwner()
		if (this.client.isOwner(message.author) || this.client.user!.id === message.author.id) return false;
		if (this.client.cache.global.blacklistedChannels.includes(message.channel!.id) && !command.bypassChannelBlacklist) {
			void this.client.console.verbose(
				InhibitorReason.ChannelGlobalBlacklist,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
