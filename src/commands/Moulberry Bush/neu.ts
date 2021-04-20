/* eslint-disable @typescript-eslint/no-empty-function */
import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';

export default class NeuCommand extends BushCommand {
	public constructor() {
		super('neu', {
			aliases: ['neu', 'patch'],
			category: "Moulberry's Bush",
			description: {
				content: 'sends a message',
				usage: '-neu',
				examples: ['-neu']
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}
	public async exec(message: Message): Promise<unknown> {
		await message.channel.send('Please download the latest patch from <#693586404256645231>.');
		return message.delete().catch(() => {});
	}
}
