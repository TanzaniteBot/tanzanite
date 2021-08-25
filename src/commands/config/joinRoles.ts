import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Role } from 'discord.js';

export default class JoinRolesCommand extends BushCommand {
	public constructor() {
		super('joinRoles', {
			aliases: ['joinroles', 'joinrole', 'jr'],
			category: 'config',
			description: {
				content: 'Configure what roles to assign to someone when they join the server.',
				usage: 'joinroles <role>',
				examples: ['joinroles @member']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: 'What role would you like me to assign to users when they join the server?',
						retry: '{error} Choose a valid role',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'role',
					description: 'What role would you like me to assign to users when they join the server?',
					type: 'ROLE',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, { role }: { role: Role }): Promise<unknown> {
		const joinRoles = await message.guild!.getSetting('joinRoles');
		const newValue = util.addOrRemoveFromArray(joinRoles.includes(role.id) ? 'remove' : 'add', joinRoles, role.id);
		await message.guild!.setSetting('joinRoles', newValue);
		return await message.util.reply({
			content: `${util.emojis.success} Successfully ${joinRoles.includes(role.id) ? 'removed' : 'added'} <@&${
				role.id
			}> from being assigned to members when they join the server.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
