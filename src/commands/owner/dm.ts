import { Message, User } from 'discord.js'
import { BotCommand } from '../../classes/BotCommand'

export default class DMCommand extends BotCommand {
	public constructor() {
		super('dm', {
			aliases: ['dm'],
			category: 'owner',
			description: {
				content: 'Use the command to dm a specified user',
				usage: 'dm <user> <message to send to the user>',
				examples: [
					'dm TrashCan bad lol noob get good',
					'dm ironm00n noob get good smh my head'
				]
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to send the dm to'
					}
				},
				{
					id: 'dmmessage',
					match: 'rest',
					type: 'string',
					prompt: {
						start: 'What message would you like to send to the user'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		})
	}

	public async exec(message: Message, { user, dmmessage }: { user: User, dmmessage: string }): Promise<void> {
		try {
			await user.send(dmmessage)
			await message.util.send(`Dm sent to ${user.tag}!`)
		} catch (e) {
			await message.util.send('Error occured when sending:\n' + await this.client.consts.haste(e.stack))
		}
	}
}
