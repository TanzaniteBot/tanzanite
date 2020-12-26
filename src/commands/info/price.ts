import { Command } from 'discord-akairo'
import { Message/*, MessageEmbed*/ } from 'discord.js'

export default class PriceCommand extends Command {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'info',
			description: {
				usage: 'price [item id]',
				examples: [
					'price ASPECT_OF_THE_END'
				],
				content: 'Finds the lowest bin of an item.'
			},
			ratelimit: 4,
			cooldown: 4000,
			args : [
				{
					id: 'item',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What item would you like look up'
					}
				}
			]
		})
	}
	public async exec(message: Message): Promise<void> {
		message.channel._typing
	}
/**     
	public async exec(message: Message, { command }: { command: Command }): Promise<Message | Message[]> {

	} */
}