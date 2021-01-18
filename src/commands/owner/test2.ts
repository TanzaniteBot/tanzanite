import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message } from 'discord.js';

export default class Test2Command extends BotCommand {
	public constructor() {
		super('test2', {
			aliases: ['test2'],
			category: 'owner',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Another testing command',
				usage: 'test2',
				examples: ['test2'],
			},
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message): Promise<void> {
		await message.channel.send('owo');
	}
}
