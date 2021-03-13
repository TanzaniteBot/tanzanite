import { BotCommand } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message, User } from 'discord.js';

export default class SuggesterCommand extends BotCommand {
	public constructor() {
		super('suggester', {
			aliases: ['suggester'],
			category: 'mb',
			description: {
				content: 'A command to give people the suggester role.',
				usage: 'suggester [user]',
				examples: ['suggester IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to add/remove the suggester role from?',
						retry: '<:no:787549684196704257> Pick a valid user to add/remove the suggester role from.'
					}
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		if (message.guild.id !== '516977525906341928') {
			await message.util.reply("This command can only be run in Moulberry's Bush.");
			return;
		}
		const allowedRoles = [
			'742165914148929536', //Moulberry
			'746541309853958186', //Admin Perms
			'782803470205190164', //Sr. Mod
			'737308259823910992', //Mod
			'737440116230062091', //helper
			'783537091946479636', //Trial Helper
			'694431057532944425' //Contributor
		];
		try {
			if (message.member?.roles.cache.some((r) => allowedRoles.includes(r.id))) {
				const member = message.guild.members.resolve(user);
				if (member.roles.cache.has('811922322767609877')) {
					await member.roles.remove('811922322767609877');
					await message.util.reply(`Removed the <@&811922322767609877> from <@!${user.id}>.`, {
						allowedMentions: AllowedMentions.none()
					});
					return;
				} else {
					await member.roles.add('811922322767609877');
					await message.util.reply(`Added the <@&811922322767609877> to <@!${user.id}>.`, {
						allowedMentions: AllowedMentions.none()
					});
					return;
				}
			} else {
				await message.util.reply('Only people with certain roles can use this command.');
				return;
			}
		} catch {
			await message.util.reply('There was an error running the command.');
			return;
		}
	}
}
