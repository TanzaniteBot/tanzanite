import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class ChannelGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGuildBlacklist', {
			reason: 'channelGuildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user.id === message.author.id)
			return false;
		if ((await message.guild.getSetting('blacklistedChannels'))?.includes(message.channel.id)) {
			// client.console.debug(`channelGuildBlacklist blocked message.`);
			return true;
		}
	}
}
