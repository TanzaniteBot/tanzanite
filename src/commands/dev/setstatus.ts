import { BotCommand, PermissionLevel } from '../../lib/extensions/BotCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message } from 'discord.js';

export default class SetStatusCommand extends BotCommand {
	public constructor() {
		super('setstatus', {
			aliases: ['setstatus'],
			category: 'dev',
			description: {
				content: "A command to set the bot's status.",
				usage: 'setstatus <status>',
				examples: ['setstatus hi']
			},
			permissionLevel: PermissionLevel.Owner,
			args: [
				{
					id: 'status',
					type: 'string',
					match: 'content',
					prompt: {
						start: "What would you like to set the bot's status to?",
						retry: '<:no:787549684196704257> Choose a valid status.'
					}
				}
			]
		});
	}
	//ported from old bot
	public async exec(message: Message, { status }: { status: string }): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.util.reply('Only owners can use this command.');
			return;
		}
		try {
			await this.client.user.setActivity(status);
			await message.util.reply(`Status changed to \`${status}\``, {
				allowedMentions: AllowedMentions.none()
			});
		} catch (error) {
			//
		}
	}
}
