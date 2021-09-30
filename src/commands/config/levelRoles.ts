import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class LevelRolesCommand extends BushCommand {
	public constructor() {
		super('levelRole', {
			aliases: ['levelrole', 'levelroles', 'lr'],
			category: 'config',
			description: {
				content: 'Command description.',
				usage: 'levelrole <role> <level>',
				examples: ['levelrole 1 2']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: 'What would you like to set your first argument to be?',
						retry: '{error} Pick a valid argument.',
						optional: false
					}
				},
				{
					id: 'level',
					type: 'integer',
					prompt: {
						start: 'What would you like to set your second argument to be?',
						retry: '{error} Pick a valid argument.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'role',
					description: 'What would you like to set your first argument to be?',
					type: 'STRING',
					required: true
				},
				{
					name: 'level',
					description: 'What would you like to set your second argument to be?',
					type: 'STRING',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD', 'MANAGE_ROLES']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { required_argument: string; optional_argument: string }
	): Promise<unknown> {
		return await message.util.reply(`${util.emojis.error} Do not use the template command.`);
		args;
	}
}
