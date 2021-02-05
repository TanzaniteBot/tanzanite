import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message                     } from 'discord.js'                 ;

export default class SayCommand extends BotCommand {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'owner',
			description: {
				content: 'A command make the bot say something.',
				usage: 'say <message> [channel]',
				examples: ['say hello #general'],
			},
			args: [
				{
					id: 'say',
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What would you like say',
					},
				},
				{
					id: 'channel',
					type: ''
				}
			],
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message, { say }: { say: string }): Promise<void> {
		if (message.deletable) {
			await message.delete();
		}
		await message.util.send(say);
	}
}
