import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import BotClient from '../../extensions/BotClient';
import got from 'got/dist/source';
import FuzzySearch from 'fuzzy-search';

export default class PriceCommand extends BotCommand {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'Skyblock',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			description: {
				usage: 'price <item id>',
				examples: ['price ASPECT_OF_THE_END'],
				content: 'Finds the price information of an item.',
			},
			ratelimit: 4,
			cooldown: 4000,
			typing: true,
			args: [
				{
					id: 'item',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What item would you like to find the price of?',
					},
				},
				{
					id: 'strict',
					type: 'flag',
					flag: '--strict',
				},
			],
		});
	}
	public async exec(message: Message, { item, strict }: { item: string; strict: boolean }): Promise<Message> {
		const bazaar = JSON.parse((await got.get(`https://api.hypixel.net/skyblock/bazaar?key=${this.client.credentials.hypixelApiKey}`)).body);
		//console.log(bazaar)
		const currentLowestBIN = JSON.parse((await got.get('http://moulberry.codes/lowestbin.json')).body),
			averageLowestBIN = JSON.parse((await got.get('http://moulberry.codes/auction_averages_lbin/3day.json')).body),
			auctionAverages = JSON.parse((await got.get('http://moulberry.codes/auction_averages/3day.json')).body), //formatted differently to currentLowestBIN and averageLowestBIN
			AlmostParsedItem = item.toString().toUpperCase().replace(/ /g, '_'),
			client = <BotClient>this.client,
			priceEmbed = new MessageEmbed(),
			parsedItem = AlmostParsedItem;

		/**I will deal with the fuzzy search later*/

		//listOfItems = bazaar['products'].toArray().concat(currentLowestBIN.toArray(), auctionAverages.toArray()),
		//searcher = new FuzzySearch(listOfItems, {caseSensitive:false});
		//	let parsedItem;
		//	if (strict){
		//	parsedItem = searcher.search(AlmostParsedItem);
		//}else{
		//parsedItem = AlmostParsedItem
		//}
		//console.log(parsedItem)
		/*Bazaar Price*/
		if (bazaar['products'][parsedItem]) {
			const bazaarPriceEmbed = new MessageEmbed();

			bazaarPriceEmbed
				.setColor(client.consts.Green)
				.setTitle(`Bazaar Information for \`${parsedItem}\``)
				.addField('Sell Price', await Bazaar('sellPrice', 2, true))
				.addField('Buy Price', await Bazaar('buyPrice', 2, true))
				.addField('Margin', (Number(await Bazaar('buyPrice', 2, false)) - Number(await Bazaar('sellPrice', 2, false))).toLocaleString())
				.addField('Current Sell Orders', await Bazaar('sellOrders', 0, true))
				.addField('Current Buy Orders', await Bazaar('buyOrders', 0, true));
			return message.util.send(bazaarPriceEmbed);
		}

		/*Check if item is in the */
		if (currentLowestBIN[parsedItem] || averageLowestBIN[parsedItem] || auctionAverages[parsedItem]) {
			priceEmbed
				.setColor(client.consts.Green)
				.setTitle(`Price Information for \`${parsedItem}\``)
				.setFooter('All information is based on the last 3 days.');
		} else {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(client.consts.ErrorColor).setDescription(`\`${parsedItem}\` is not a valid item id.`);
			return message.util.send(errorEmbed);
		}
		if (currentLowestBIN[parsedItem]) {
			const currentLowestBINPrice = currentLowestBIN[parsedItem].toLocaleString();
			priceEmbed.addField('Current Lowest BIN', currentLowestBINPrice);
		}
		if (averageLowestBIN[parsedItem]) {
			const averageLowestBINPrice = averageLowestBIN[parsedItem].toLocaleString();
			priceEmbed.addField('Average Lowest BIN', averageLowestBINPrice);
		}
		if (!auctionAverages[parsedItem]) {
			return message.util.send(priceEmbed);
		}
		if (auctionAverages[parsedItem]['price']) {
			const auctionAveragesPrice = auctionAverages[parsedItem]['price'].toLocaleString();
			priceEmbed.addField('Average Auction Price', auctionAveragesPrice);
		}
		if (auctionAverages[parsedItem]['count']) {
			const auctionAveragesCountPrice = auctionAverages[parsedItem]['count'].toLocaleString();
			priceEmbed.addField('Average Auction Count', auctionAveragesCountPrice);
		}
		if (auctionAverages[parsedItem]['sales']) {
			const auctionAveragesSalesPrice = auctionAverages[parsedItem]['sales'].toLocaleString();
			priceEmbed.addField('Average Auction Sales', auctionAveragesSalesPrice);
		}
		if (auctionAverages[parsedItem]['clean_price']) {
			const auctionAveragesCleanPrice = auctionAverages[parsedItem]['clean_price'].toLocaleString();
			priceEmbed.addField('Average Auction Clean Price', auctionAveragesCleanPrice);
		}
		if (auctionAverages[parsedItem]['clean_sales']) {
			const auctionAveragesCleanSales = auctionAverages[parsedItem]['clean_sales'].toLocaleString();
			priceEmbed.addField('Average Auction Clean Sales', auctionAveragesCleanSales);
		}
		return message.util.send(priceEmbed);

		async function Bazaar(Information: string, digits: number, commas: boolean): Promise<string> {
			const a = Number(Number(bazaar['products'][parsedItem]['quick_status'][Information]).toFixed(digits));
			let b;
			if (commas === true) {
				b = a.toLocaleString();
			} else {
				b = a.toString();
			}
			return b;
		}
		/**async function AuctionExist(type: 'a'|'b'|'c', data?: string): Promise<boolean> {
			let aaa;
			switch (type){
				case 'a':
					aaa = currentLowestBIN
					break
				case 'b':
					aaa = averageLowestBIN
					break
				case 'c':
					aaa = auctionAverages
					break
			}
			if (aaa[parsedItem]) return true 
			else return false
		}
		async function Auction(): Promise<String> {

		}*/
	}
}
