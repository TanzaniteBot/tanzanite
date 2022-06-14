import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGlobalBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGlobalBlacklist', {
			reason: 'channelGlobalBlacklist',
			category: 'blacklist',
			type: 'post',
			priority: 500
		});
	}

	public override exec(message: CommandMessage | SlashMessage, command: BushCommand): boolean {
		if (!message.author || !message.inGuild()) return false;
		// do not change to message.author.isOwner()
		if (client.isOwner(message.author) || client.user!.id === message.author.id) return false;
		if (client.cache.global.blacklistedChannels.includes(message.channel!.id) && !command.bypassChannelBlacklist) {
			void client.console.verbose(
				'channelGlobalBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
