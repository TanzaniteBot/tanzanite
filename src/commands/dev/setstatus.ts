import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message } from 'discord.js';

export default class SetStatusCommand extends BotCommand {
	public constructor() {
		super('setstatus', {
			aliases: ['setstatus'],
			category: 'dev',
			description: {
				content: 'A command to set the bot\'s status.',
				usage: 'setstatus <status>',
				examples: ['setstatus'],
			},
			permissionLevel: PermissionLevel.Owner,
			args: [
				{
					id: 'status',
					type: 'string',
					match: 'content',
				},
			],
		});
	}
	//ported from old bot
	public async exec(message: Message, { status }: { status: string }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.channel.send('Only owners can use this command.');
			return;
		}
		try {
			await this.client.user.setActivity(status);
			await message.util.send(`Status changed to \`${status}\``, {
				allowedMentions: AllowedMentions.none(),
			});
		} catch (error) {
			//
		}
	}
}
