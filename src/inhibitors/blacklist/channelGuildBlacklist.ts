import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class ChannelGuildBlacklistInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.ChannelGuildBlacklist, {
			reason: InhibitorReason.ChannelGuildBlacklist,
			type: InhibitorType.Post,
			priority: 499
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (!message.author || !message.inGuild()) return false;
		//! do not change to message.author.isOwner()
		if (this.client.isOwner(message.author) || this.client.user!.id === message.author.id) return false;
		if (
			(await message.guild.getSetting('bypassChannelBlacklist'))?.includes(message.author.id) &&
			!command.bypassChannelBlacklist
		) {
			return false;
		}
		if (
			(await message.guild.getSetting('blacklistedChannels'))?.includes(message.channel!.id) &&
			!command.bypassChannelBlacklist
		) {
			void this.client.console.verbose(
				InhibitorReason.ChannelGuildBlacklist,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
