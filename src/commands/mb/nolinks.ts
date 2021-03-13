/*import { BotCommand } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message, User } from 'discord.js';
import mongoose from 'mongoose';

export default class NoLinksCommand extends BotCommand {
	public constructor() {
		super('nolinks', {
			aliases: ['nolinks'],
			category: 'mb',
			description: {
				content: 'A command to give people the suggester role.',
				usage: 'suggester [user]',
				examples: ['suggester IRONM00N'],
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to add/remove the suggester role from?',
					},
				}
			]
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		if (message.channel.type === 'dm') return await message.util.send('This command cannot be run in dms.');
		if (message.guild.id !== '516977525906341928') return await message.util.send('This command can only be run in Moulberry\'s Bush.');
		const allowedRoles = [
			'742165914148929536', //Moulberry
			'746541309853958186', //Admin Perms
			'782803470205190164', //Sr. Mod
			'737308259823910992', //Mod
			//'737440116230062091', //helper
			//'783537091946479636', //Trial Helper
		]	
		try{
			if (message.member?.roles.cache.some(r => allowedRoles.includes(r.id))){
				const member = message.guild.members.resolve(user);
				if (member.roles.cache.has('811922322767609877')) {
					await member.roles.remove('811922322767609877');
					return await message.util.send(`Removed the <@&811922322767609877> from <@!${message.author.id}>.`, {
						allowedMentions: AllowedMentions.none(),
					});
				}else{
					await member.roles.add('811922322767609877');
					return await message.util.send(`Added the <@&811922322767609877> to <@!${message.author.id}>.`, {
						allowedMentions: AllowedMentions.none(),
					});
				}
			}else{
				return await message.util.send('Only people with certain roles can use this command.')
			}
		}catch{
			return await message.util.send('There was an error running the command.');
		}
	}
}
*/
