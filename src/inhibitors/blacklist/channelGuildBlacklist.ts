import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

export default class ChannelGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGuildBlacklist', {
			reason: 'channelGuildBlacklist',
			category: 'blacklist',
			type: 'post',
			priority: 499
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (!message.author || !message.inGuild()) return false;
		// do not change to message.author.isOwner()
		if (client.isOwner(message.author) || client.user!.id === message.author.id) return false;
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
			void client.console.verbose(
				'channelGuildBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
