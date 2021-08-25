import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Channel } from 'discord.js';

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
	public override async exec(message: BushMessage | BushSlashMessage, { channel }: { channel: Channel }): Promise<unknown> {
		const autoPublishChannels = await message.guild!.getSetting('joinRoles');
		const newValue = util.addOrRemoveFromArray(
			autoPublishChannels.includes(channel.id) ? 'remove' : 'add',
			autoPublishChannels,
			channel.id
		);
		await message.guild!.setSetting('joinRoles', newValue);
		return await message.util.reply({
			content: `${util.emojis.success} Successfully ${
				autoPublishChannels.includes(channel.id) ? 'disabled' : 'enabled'
			} auto publishing in <#${channel.id}>.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
