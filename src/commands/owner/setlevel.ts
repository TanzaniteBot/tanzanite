import { User } from 'discord.js';
import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { Level } from '../../lib/models';
import AllowedMentions from '../../lib/utils/AllowedMentions';

export default class SetLevelCommand extends BotCommand {
	constructor() {
		super('setlevel', {
			aliases: ['setlevel'],
			description: {
				content: 'Sets the level of a user',
				usage: 'setlevel <user> <level>',
				examples: ['setlevel @Moulberry 69']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to change the level of?',
						retry:
							'Invalid user. What user would you like to change the level of?'
					}
				},
				{
					id: 'level',
					type: 'number',
					prompt: {
						start: 'What level would you like to set?',
						retry: 'Invalid user. What level would you like to set?'
					}
				}
			],
			ownerOnly: true
		});
	}
	async exec(
		message: Message,
		{ user, level }: { user: User; level: number }
	): Promise<void> {
		const [levelEntry] = await Level.findOrBuild({
			where: {
				id: user.id
			},
			defaults: {
				id: user.id
			}
		});
		levelEntry.xp = Level.convertLevelToXp(level);
		await levelEntry.save();
		await message.reply(
			`Successfully set level of <@${user.id}> to \`${level}\` (\`${levelEntry.xp}\` XP)`,
			{
				allowedMentions: AllowedMentions.none()
			}
		);
	}
}
