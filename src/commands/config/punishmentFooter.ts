import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Util } from 'discord.js';

export default class PunishmentFooterCommand extends BushCommand {
	public constructor() {
		super('punishmentFooter', {
			aliases: ['punishmentfooter'],
			category: 'config',
			description: {
				content: 'Configure or reset what should follow all punishment related dms.',
				usage: 'punishmentfooter [message]',
				examples: ['punishmentfooter', 'prefix you can appeal at https://example.com.']
			},
			args: [
				{
					id: 'ending',
					type: 'string',
					match: 'restContent',
					prompt: {
						start: 'What message would you like to follow punishment dms?',
						retry: '{error} Choose a valid role.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'ending',
					description: 'What message would you like to follow punishment dms?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	async exec(message: BushMessage | BushSlashMessage, args: { ending: string }): Promise<unknown> {
		await message.guild.setSetting('punishmentEnding', args.ending || null);
		if (args.ending)
			return await message.util.send({
				content: `${
					this.client.util.emojis.success
				} Changed the server's punishment footer to \n\`\`\`${Util.cleanCodeBlockContent(args.ending)}\`\`\`.`,
				allowedMentions: AllowedMentions.none()
			});
		else return await message.util.send(`${this.client.util.emojis.success} Removed he server's punishment footer.`);
	}
}
