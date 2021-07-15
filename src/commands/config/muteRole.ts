import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Role } from 'discord.js';

export default class MuteRoleCommand extends BushCommand {
	public constructor() {
		super('muteRole', {
			aliases: ['muterole'],
			category: 'config',
			description: {
				content: 'Configure what role to use when muting users.',
				usage: 'muterole <role>',
				examples: ['muterole 748912426581229690']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: "What would you like to set the server's mute role to?",
						retry: '{error} Choose a valid role.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'role',
					description: "What would you like to set the server's mute role to?",
					type: 'ROLE',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	async exec(message: BushMessage | BushSlashMessage, args: { role: Role }): Promise<void> {
		await message.guild.setSetting('muteRole', args.role.id);
		await message.util.send({
			content: `${this.client.util.emojis.success} Changed the server's mute role to <@&${args.role.id}>.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
