import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

export default class UserGlobalBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGlobalBlacklist', {
			reason: 'channelGlobalBlacklist',
			category: 'blacklist',
			type: 'post',
			priority: 500
		});
	}

	public override exec(message: BushMessage | BushSlashMessage, command: BushCommand): boolean {
		if (!message.inGuild()) return false;
		if (message.author.isOwner() || client.user!.id === message.author.id) return false;
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
