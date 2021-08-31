import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class JoinRolesCommand extends BushCommand {
	public constructor() {
		super('joinRoles', {
			aliases: ['joinroles', 'joinrole', 'jr'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'joinroles <role>',
				examples: ['joinroles @member']
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
