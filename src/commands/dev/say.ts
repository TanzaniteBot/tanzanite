import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';

export default class SayCommand extends BushCommand {
	public constructor() {
		super('say', {
			aliases: ['say', 'dev'],
			category: 'dev',
			description: {
				content: 'A command make the bot say something.',
				usage: 'say <message>' /*[channel]'*/,
				examples: ['say hello' /*#general'*/]
			},
			args: [
				{
					id: 'say',
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What would you like say',
						retry: '<:error:837123021016924261> Choose something valid to say.'
					}
				}
				/*{
					id: 'channel',
					type: 'channel',
				},*/
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message, { say }: { say: string }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.channel.send('<:error:837123021016924261> Only my owners can use this command.');
			return;
		}
		if (message.deletable) {
			await message.delete();
		}
		await message.util.send(say);
	}
}
