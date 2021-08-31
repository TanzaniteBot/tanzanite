import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class PrefixCommand extends BushCommand {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'prefix [prefix]',
				examples: ['prefix', 'prefix -']
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
