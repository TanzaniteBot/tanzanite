import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import { Channel } from 'discord.js';

export default class SlowModeCommand extends BotCommand {
	public constructor() {
		super('SlowMode', {
			aliases: ['SlowMode','slow'],
			category: 'moderation',
			description: {
				content: 'A command to set the slowmode of a channel.',
				usage: 'slowmode <time>',
				examples: ['slowmode 3'],
			},
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_MESSAGES','SEND_MESSAGES'],
			args: [
				{
					id: 'length',
					type: 'number',
					default: '0',
				},
				{
					id: 'channel',
					type: 'channel',
				}
			],
			ownerOnly: true,
		});
	}
	public async exec(message: Message, {length, channel}: {length: number, channel: Channel}): Promise<void> {
		return
	}
}
