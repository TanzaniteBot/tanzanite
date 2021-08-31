import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class PunishmentFooterCommand extends BushCommand {
	public constructor() {
		super('punishmentFooter', {
			aliases: ['punishmentfooter'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'punishmentfooter [message]',
				examples: ['punishmentfooter', 'prefix you can appeal at https://example.com.']
			},
			channel: 'guild',
			hidden: true,
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		return message.util.reply(`${util.emojis.error} 'This command has been deprecated, please use the config command instead'`);
	}
}
