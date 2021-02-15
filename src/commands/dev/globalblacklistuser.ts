import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message, User } from 'discord.js';

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
						start: 'Which user would you like to change the superuser status of?',
					},
				},
			],
			permissionLevel: PermissionLevel.Owner,
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<Message> {
		if (!(this.client.config.owners.includes(message.author.id))){ 
			return await message.channel.send('How do you even see this message?')
		} 
		const userBlacklist: string[] = await this.client.globalSettings.get(this.client.user.id, 'userBlacklist', [])
		let action: string;
		if (userBlacklist.includes(user.id)){
			userBlacklist.splice(userBlacklist.indexOf(user.id), 1)
			this.client.globalSettings.set(this.client.user.id, 'userBlacklist', userBlacklist)
			action = 'removed'
		} else {
			userBlacklist.push(user.id)
			this.client.globalSettings.set(this.client.user.id, 'userBlacklist', userBlacklist)
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

