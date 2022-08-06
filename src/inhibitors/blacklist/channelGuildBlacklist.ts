import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class ChannelGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGuildBlacklist', {
			reason: 'channelGuildBlacklist',
			category: 'blacklist',
			type: 'post',
			priority: 499
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (!message.author || !message.inGuild()) return false;
		// do not change to message.author.isOwner()
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
				'channelGuildBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
