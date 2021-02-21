import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message, User } from 'discord.js';
import functions from '../../constants/functions';

export default class GlobalBlacklistUserCommand extends BotCommand {
	public constructor() {
		super('globalblacklistuser', {
			aliases: ['globalblacklistuser', 'gbuser', 'blacklist'],
			category: 'dev',
			description: {
				content: 'A command to add/remove blacklisted users.',
				usage: 'globalblacklistuser <user>',
				examples: ['globalblacklistuser IRONM00N'],
			},
			args: [
				{
					id: 'user',
					type: 'user',
					match: 'content',
					prompt: {
						start: 'Which user would you like to change the blacklisted status of?',
					},
				},
			],
			permissionLevel: PermissionLevel.Owner,
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<Message> {
		if (!(this.client.config.owners.includes(message.author.id))){ 
			return await message.channel.send('Only owners can use this command.')
		} 
		const userBlacklist: string[] = await functions.dbGet('global', 'userBlacklist') as string[];
		let action: string;
		if (userBlacklist.includes(user.id)){
			userBlacklist.splice(userBlacklist.indexOf(user.id), 1)
			await functions.dbUpdate('global', 'userBlacklist', userBlacklist)
			action = 'removed'
		} else {
			userBlacklist.push(user.id)
			await functions.dbUpdate('global', 'userBlacklist', userBlacklist)
			action = 'added'
		}
		let action2
		if (action == 'removed'){
			action2 = 'from'
		} else{
			action2 = 'to'
		}
		return await message.channel.send(`Successfully ${action} \`${user.tag}\` ${action2} the blacklisted users list.`)
	}
}

