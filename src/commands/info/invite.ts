import { Message } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';

export default class PriceCommand extends BushCommand {
	public constructor() {
		super('invite', {
			aliases: ['invite'],
			category: 'info',
			description: {
				content: 'Sends the bot invite link.',
				usage: 'invite'
			},
			ratelimit: 4,
			cooldown: 4000,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message): Promise<void> {
		await message.util.reply(`<https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=2147483647&scope=bot%20applications.commands>`);
	}
}
