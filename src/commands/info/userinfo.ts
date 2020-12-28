import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'

export default class UserinfoCommand extends BotCommand {
	public constructor() {
		super('userinfo', {
			aliases: ['userinfo'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
		})
	}
	public exec(message: Message): void {
		message.util.send('you are a user :)')
	}
}