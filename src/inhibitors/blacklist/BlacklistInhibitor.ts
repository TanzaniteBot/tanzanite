import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		})
	}

	public exec(message: Message): boolean {
		const blacklist = ['']
		return blacklist.includes(message.author.id)
	}
}