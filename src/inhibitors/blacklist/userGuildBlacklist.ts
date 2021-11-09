import { BushInhibitor, type BushMessage, type BushSlashMessage } from '#lib';

export default class UserGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGuildBlacklist', {
			reason: 'userGuildBlacklist',
			category: 'blacklist',
			type: 'pre',
			priority: 20
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (!message.author || !message.guild) return false;
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user!.id === message.author.id)
			return false;
		if ((await message.guild.getSetting('blacklistedUsers'))?.includes(message.author.id)) {
			void client.console.verbose('userGuildBlacklist', `Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`)
			return true;
		}
		return false;
	}
}
