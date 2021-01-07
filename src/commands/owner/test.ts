import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'
import AllowedMentions from '../../classes/AllowedMentions'

export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'owner',
			description: {
				content: 'A command to test wip concepts.',
				usage: 'test',
				examples: [
					'test'
				],
			},
			ownerOnly: true
		})
	}
	public async exec(message: Message): Promise<void> {
		await message.util.send(`<@!${message.author.id}>`, {allowedMentions: AllowedMentions.none()})
	}
}