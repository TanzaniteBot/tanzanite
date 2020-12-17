import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class DMCommand extends Command {
	public constructor() {
		super('dm', {
			aliases: ['dm'],
			category: 'owner',
			description: {
				content: 'Use the command to dm a specified user',
				usage: 'dm <user> <message to send to the user>',
				examples: [
					'dm TrashCan bad lol noob get good',
					'dm ironm00n fucking noob get good smh my head'
				]
			},
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: 'What user would you like to send the dm to'
					}
				},
				{
					id: 'dmmessage',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What message would u like to send to the user'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		})
	}

	public async exec(message: Message, { user, dmmessage }: { user: string, dmmessage: string }): Promise<void> {
		message.author.send(dmmessage)
	}
}
