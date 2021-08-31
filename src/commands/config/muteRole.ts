import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class MuteRoleCommand extends BushCommand {
	public constructor() {
		super('muteRole', {
			aliases: ['muterole'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'muterole <role>',
				examples: ['muterole 748912426581229690']
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
