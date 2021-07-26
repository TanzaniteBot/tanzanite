import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageActionRow, MessageButton } from 'discord.js';

export default class InviteCommand extends BushCommand {
	public constructor() {
		super('invite', {
			aliases: ['invite'],
			category: 'info',
			description: {
				content: 'Sends the bot invite link.',
				usage: 'invite',
				examples: ['invite']
			},
			ratelimit: 4,
			cooldown: 4000,
			clientPermissions: ['SEND_MESSAGES'],
			slash: true
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		if (client.config.isDevelopment) return await message.util.reply(`${util.emojis.error} The dev bot cannot be invited.`);
		const ButtonRow = new MessageActionRow().addComponents(
			new MessageButton({
				style: 'LINK',
				label: 'Invite Me',
				url: `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2147483647&scope=bot%20applications.commands`
			})
		);
		return await message.util.reply({ content: 'You can invite me here:', components: [ButtonRow] });
	}
}
