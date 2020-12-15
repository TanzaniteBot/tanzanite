import { Inhibitor } from 'discord-akairo'
import { Message } from 'discord.js'

export class BlacklistInhibitor extends Inhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist',
			type: 'post',
			priority: 1
		})
	}

	public exec(message: Message): boolean {
		console.log(1)
		const blacklist = ['487443883127472129']
		return blacklist.includes(message.author.id)
	}
}