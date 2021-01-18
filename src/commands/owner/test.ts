import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message } from 'discord.js';

export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'owner',
			description: {
				content: 'A command to test wip concepts.',
				usage: 'test',
				examples: ['test'],
			},
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message): Promise<void> {
		await message.util.send(`<@!${message.author.id}>`, {
			allowedMentions: AllowedMentions.none(),
		});
	}
}
