import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import got from 'got/dist/source'
import BotClient from '../../client/BotClient'

export default class PriceCommand extends Command {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
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
						start: 'What item would you like to find the lowest BIN of?'
					}
				}
			],
		})
	}
	public async exec(message: Message, { item }: { item: Command }): Promise<Message> {
		const price = JSON.parse((await got.get('http://51.75.78.252/lowestbin.json')).body)		
		const item1 = item.toString().toUpperCase()
		const itemstring = item1.replace(/ /g,'_')
		const client = <BotClient> this.client
		try{
			if (price[itemstring]){
				const embed = new MessageEmbed()
				const prettyPrice = price[itemstring].toLocaleString()
				embed
					.setColor(client.consts.Green)
					.setDescription('The current lowest bin of `'+itemstring+'` is **'+prettyPrice+'**.')
				return message.util.send(embed)
			}else{
				const embed = new MessageEmbed()
				embed
					.setColor(client.consts.ErrorColor)
					.setDescription('`'+itemstring+'` is not a valid item id.')
				return message.util.send(embed)
			}
		}catch(e){
			message.channel.send('error')
		}
	}
}
