import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import BotClient from '../../extensions/BotClient';
import got from 'got/dist/source';

export default class PriceCommand extends BotCommand {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				usage: 'price <item id>',
				examples: ['price ASPECT_OF_THE_END'],
				content: 'Finds the lowest bin of an item.',
			},
			ratelimit: 4,
			cooldown: 4000,
			args: [
				{
					id: 'item',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What item would you like to find the lowest BIN of?',
					},
				},
			],
		});
	}
	public async exec(message: Message, { item }: { item: string }): Promise<Message> {
		const 
			currentLowestBIN = GetJson('http://moulberry.codes/lowestbin.json'),
			averageLowestBIN = GetJson('http://moulberry.codes/auction_averages_lbin/3day.json'),
			auctionAverages = GetJson('http://moulberry.codes/auction_averages/3day.json'), //these are formatted differently to currentLowestBIN and averageLowestBIN
			ParsedItem = item.toString().toUpperCase().replace(/ /g, '_'),
		
			client = <BotClient>this.client;
		//switch (){
		//	case
		//}
		
		if (currentLowestBIN[ParsedItem]) {
			const prettyPrice = currentLowestBIN[ParsedItem].toLocaleString(),
				priceEmbed = new MessageEmbed();
			priceEmbed
				.setColor(client.consts.Green)
				.setTitle(`Price Information for \`${item}\``)
				//.setDescription(`The current lowest bin of \`${itemstring}\` is **${prettyPrice}**.`)
				.addField('Current Lowest BIN', currentLowestBIN);
			return message.util.send(priceEmbed);
		} else {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(client.consts.ErrorColor).setDescription(`\`${ParsedItem}\` is not a valid item id.`);
			return message.util.send(errorEmbed);
		}



		async function GetJson(url:string) {
			return JSON.parse((await got.get(url)).body)
		}
		async function Pretty(number:number) {
			//
		}
	}
}
