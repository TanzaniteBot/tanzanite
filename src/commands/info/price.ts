import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import BotClient from '../../extensions/BotClient';
import got from 'got/dist/source';

export default class PriceCommand extends BotCommand {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'info',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			description: {
				usage: 'price <item id>',
				examples: ['price ASPECT_OF_THE_END'],
				content: 'Finds the price information of an item.',
			},
			ratelimit: 4,
			cooldown: 4000,
			args: [
				{
					id: 'item',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What item would you like to find the price of?',
					},
				},
			],
		});
	}
	public async exec(message: Message, { item }: { item: string }): Promise<Message> {
		const 
			currentLowestBIN = JSON.parse((await got.get('http://moulberry.codes/lowestbin.json')).body),
			averageLowestBIN = JSON.parse((await got.get('http://moulberry.codes/auction_averages_lbin/3day.json')).body),
			auctionAverages = JSON.parse((await got.get('http://moulberry.codes/auction_averages/3day.json')).body), //formatted differently to currentLowestBIN and averageLowestBIN
			ParsedItem = item.toString().toUpperCase().replace(/ /g, '_'),
			client = <BotClient>this.client,
			priceEmbed = new MessageEmbed();
		if (currentLowestBIN[ParsedItem] || averageLowestBIN[ParsedItem] || auctionAverages[ParsedItem]){	
			priceEmbed
				.setColor(client.consts.Green)
				.setTitle(`Price Information for \`${ParsedItem}\``)
				.setFooter('All information is based on the last 3 days.')
		}else {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(client.consts.ErrorColor).setDescription(`\`${ParsedItem}\` is not a valid item id.`);
			return message.util.send(errorEmbed);
		}
		if (currentLowestBIN[ParsedItem]) {
			const currentLowestBINPrice = currentLowestBIN[ParsedItem].toLocaleString();
			priceEmbed.addField('Current Lowest BIN', currentLowestBINPrice)
		}if (averageLowestBIN[ParsedItem]){
			const averageLowestBINPrice = averageLowestBIN[ParsedItem].toLocaleString();
			priceEmbed.addField('Average Lowest BIN', averageLowestBINPrice);
		}if (!auctionAverages[ParsedItem]){
			return message.util.send(priceEmbed);
		} 
		if (auctionAverages[ParsedItem]['price']){
			const auctionAveragesPrice = auctionAverages[ParsedItem]['price'].toLocaleString();
			priceEmbed.addField('Average Auction Price', auctionAveragesPrice);
		}if (auctionAverages[ParsedItem]['count']){
			const auctionAveragesCountPrice = auctionAverages[ParsedItem]['count'].toLocaleString();
			priceEmbed.addField('Average Auction Count', auctionAveragesCountPrice);
		}if (auctionAverages[ParsedItem]['sales']){
			const auctionAveragesSalesPrice = auctionAverages[ParsedItem]['sales'].toLocaleString();
			priceEmbed.addField('Average Auction Sales', auctionAveragesSalesPrice);
		}if (auctionAverages[ParsedItem]['clean_price']){
			const auctionAveragesCleanPrice = auctionAverages[ParsedItem]['clean_price'].toLocaleString();
			priceEmbed.addField('Average Auction Clean Price', auctionAveragesCleanPrice);
		}if (auctionAverages[ParsedItem]['clean_sales']){
			const auctionAveragesCleanSales = auctionAverages[ParsedItem]['clean_sales'].toLocaleString();
			priceEmbed.addField('Average Auction Clean Sales', auctionAveragesCleanSales);
		}
		return message.util.send(priceEmbed);
	}
}
