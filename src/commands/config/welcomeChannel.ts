import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class WelcomeChannelCommand extends BushCommand {
	public constructor() {
		super('welcomeChannel', {
			aliases: ['welcomechannel', 'wc'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'welcomechannel [channel]',
				examples: ['welcomechannel #welcome']
			},
			channel: 'guild',
			hidden: true,
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		return message.util.reply(`${util.emojis.error} 'This command has been deprecated, please use the config command instead'`);
	}
}
