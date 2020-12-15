import { Command } from 'discord-akairo'
import { Message} from 'discord.js'

export default class SayCommand extends Command {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'owner',
			description: {
				content: 'A command to test shit',
				usage: 'test',
				examples: [
					'test'
				]
			},
			args: [
				{
					id: 'say',
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What would you like say'
					}
				}
			],
			ownerOnly: true
		})
	}
	public async exec(message: Message, { say }: { say: string }): Promise<void> {
		if ( message.deletable) {
			message.delete({timeout: 1})
		} 
		message.util.send(say)
	}
}