import { Inhibitor } from 'discord-akairo'
import { Message } from 'discord.js'

export default class BlacklistInhibitor extends Inhibitor {
	constructor() {
		super('blacklist', {
			reason: 'blacklist'
		})
	}

	public exec(message: Message): boolean {
		const blacklist = ['ids here idk']
		return blacklist.includes(message.author.id)
	}
}