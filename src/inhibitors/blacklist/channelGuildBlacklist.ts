import { BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class ChannelGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('channelGuildBlacklist', {
			reason: 'channelGuildBlacklist',
			category: 'blacklist',
			type: 'all'
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (
			this.client.isOwner(message.author) ||
			this.client.isSuperUser(message.author) ||
			this.client.user.id === message.author.id
		)
			return false;
		if ((await message.guild.getSetting('blacklistedChannels'))?.includes(message.channel.id)) {
			this.client.console.debug(`channelGuildBlacklist blocked message.`);
			return true;
		}
	}
}
