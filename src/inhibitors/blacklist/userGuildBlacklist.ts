import { BushInhibitor, type CommandMessage, type SlashMessage } from '#lib';

export default class UserGuildBlacklistInhibitor extends BushInhibitor {
	public constructor() {
		super('userGuildBlacklist', {
			reason: 'userGuildBlacklist',
			category: 'blacklist',
			type: 'pre',
			priority: 20
		});
	}

	public override async exec(message: CommandMessage | SlashMessage): Promise<boolean> {
		if (!message.author || !message.inGuild()) return false;
		// do not change to message.author.isOwner()
		if (client.isOwner(message.author) || client.isSuperUser(message.author) || client.user!.id === message.author.id)
			return false;
		if ((await message.guild.getSetting('blacklistedUsers'))?.includes(message.author.id)) {
			void client.console.verbose(
				'userGuildBlacklist',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
