import { Role } from 'discord.js';
import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushSlashMessage } from '../../lib/extensions/discord-akairo/BushSlashMessage';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class MuteRoleCommand extends BushCommand {
	constructor() {
		super('muteRole', {
			aliases: ['muterole'],
			category: 'config',
			description: {
				content: 'Configure what role to use when muting users.',
				usage: 'prefix [prefix]',
				examples: ['prefix', 'prefix +']
			},
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
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
					type: 'ROLE',
					name: 'role',
					description: "What would you like to set the server's mute role to?",
					required: true
				}
			]
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
