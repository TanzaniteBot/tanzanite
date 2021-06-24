import { Role } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushMessage } from '../../lib/extensions/BushMessage';
import { Guild } from '../../lib/models';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class MuteRoleCommand extends BushCommand {
	constructor() {
		super('muteRole', {
			aliases: ['muterole'],
			category: 'config',
			description: {
				content: 'Set the prefix of the current server (resets to default if prefix is not given)',
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
					description: 'The mute role for this server.',
					required: true
				}
			]
		});
	}

	async exec(message: BushMessage | BushSlashMessage, args: { role: Role }): Promise<void> {
		let row = await Guild.findByPk(message.guild.id);
		if (!row) {
			row = Guild.build({
				id: message.guild.id
			});
		}
		row.muteRole = args.role.id;
		await row.save();
		await message.util.send({
			content: `${this.client.util.emojis.success} Changed the mute role to <@&${args.role.id}>.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
