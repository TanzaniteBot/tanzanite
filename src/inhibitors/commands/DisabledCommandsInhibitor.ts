import { Command } from 'discord-akairo'
import { Message } from 'discord.js'
import { BotInhibitor } from '../../classes/BotInhibitor'

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('disabled', {
			reason: 'disabled'
		})
	}

	public exec(message: Message, command: Command | null | undefined): boolean {
		if (this.client.disabledCommands.includes(command?.id)) {
			return true
		}
		return false
	}
}