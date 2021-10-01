import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

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
		if (!message.author || !message.guild) return false;
		if (client.isOwner(message.author) || /* client.isSuperUser(message.author) ||*/ client.user!.id === message.author.id)
			return false;
		if (client.cache.global.blacklistedChannels.includes(message.channel!.id) && !command.bypassChannelBlacklist) {
			return true;
		}
		return false;
	}
}
