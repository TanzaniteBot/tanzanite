import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message, User } from 'discord.js';

export default class SuperUserCommand extends BotCommand {
	public constructor() {
		super('superuser', {
			aliases: ['superuser', 'unsuperuser'],
			category: 'dev',
			description: {
				content: 'A command to add/remove superusers.',
				usage: 'superuser <user>',
				examples: ['superuser IRONM00N'],
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
		const superUsers: string[] = await this.client.globalSettings.get(this.client.user.id, 'superUsers', [])
		let action: string;
		if (superUsers.includes(user.id)){
			superUsers.splice(superUsers.indexOf(user.id), 1)
			this.client.globalSettings.set(this.client.user.id, 'superUsers', superUsers)
			action = 'removed'
		} else {
			superUsers.push(user.id)
			this.client.globalSettings.set(this.client.user.id, 'superUsers', superUsers)
			action = 'added'
		}
		let action2
		if (action == 'removed'){
			action2 = 'from'
		} else{
			action2 = 'to'
		}
		return await message.channel.send(`Successfully ${action} \`${user.tag}\` ${action2} the super users list.`)
	}
}
