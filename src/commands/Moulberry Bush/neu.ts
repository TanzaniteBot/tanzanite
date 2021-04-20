import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';

export default class ReportCommand extends BushCommand {
	public constructor() {
		super('report', {
			aliases: ['neu', 'patch'],
			category: "Moulberry's Bush",
			description: {
				content: 'sends a message',
				usage: '-neu',
				examples: ['-neu']
			},
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild'
		});
	}
	public async exec(message: Message) {
		message.channel.send('Please download the latest patch from <#693586404256645231>.');
		try {
			message.delete();
		} catch (e) {
            
        }
	}
}
