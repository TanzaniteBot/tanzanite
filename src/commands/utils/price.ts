import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import BotClient from '../../extensions/BotClient';
import got from 'got/dist/source';
import FuzzySearch from 'fuzzy-search';
import { Url } from 'node:url';
import functions from '../../constants/functions';
import chalk from 'chalk';
import log from '../../constants/log';

export default class PriceCommand extends BotCommand {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'utils',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			description: {
				usage: 'price <item id>',
				examples: ['price ASPECT_OF_THE_END'],
				content: 'Finds the price information of an item.'
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
						retry: '<:no:787549684196704257> Choose a valid item.'
					}
				},
				{
					id: 'strict',
					type: 'flag',
					flag: '--strict'
				}
			]
		});
	}
	public async exec(message: Message, { item, strict }: { item: string; strict: boolean }): Promise<void> {
		let bazaar: JSON, currentLowestBIN: JSON, averageLowestBIN: JSON, auctionAverages: JSON, AlmostParsedItem: string, client: BotClient, priceEmbed: MessageEmbed, parsedItem: string;

		try {
			bazaar = await get(`https://api.hypixel.net/skyblock/bazaar?key=${this.client.credentials.hypixelApiKey}`).catch();
			currentLowestBIN = await get('http://moulberry.codes/lowestbin.json');
			averageLowestBIN = await get('http://moulberry.codes/auction_averages_lbin/3day.json');
			auctionAverages = await get('http://moulberry.codes/auction_averages/3day.json'); //formatted differently to currentLowestBIN and averageLowestBIN
			AlmostParsedItem = item.toString().toUpperCase().replace(/ /g, '_');
			client = <BotClient>this.client;
			priceEmbed = new MessageEmbed();
			parsedItem = AlmostParsedItem;
		} catch {
			await message.reply('<:no:787549684196704257> There was an error fetching price information.');
		}

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
			const bazaarPriceEmbed = new MessageEmbed()
				.setColor(client.consts.Green)
				.setTitle(`Bazaar Information for \`${parsedItem}\``)
				.addField('Sell Price', await Bazaar('sellPrice', 2, true))
				.addField('Buy Price', await Bazaar('buyPrice', 2, true))
				.addField('Margin', (Number(await Bazaar('buyPrice', 2, false)) - Number(await Bazaar('sellPrice', 2, false))).toLocaleString())
				.addField('Current Sell Orders', await Bazaar('sellOrders', 0, true))
				.addField('Current Buy Orders', await Bazaar('buyOrders', 0, true));
			message.util.reply(bazaarPriceEmbed);
			return;
		}

		/*Check if item is in the price information*/
		if (currentLowestBIN[parsedItem] || averageLowestBIN[parsedItem] || auctionAverages[parsedItem]) {
			priceEmbed.setColor(client.consts.Green).setTitle(`Price Information for \`${parsedItem}\``).setFooter('All information is based on the last 3 days.');
		} else {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(client.consts.ErrorColor).setDescription(`\`${parsedItem}\` is not a valid item id.`);
			message.util.reply(errorEmbed);
			return;
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
			message.util.reply(priceEmbed);
			return;
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
		await message.util.reply(priceEmbed);
		return;

		function Bazaar(Information: string, digits: number, commas: boolean): Promise<string> {
			const a = Number(Number(bazaar['products'][parsedItem]['quick_status'][Information]).toFixed(digits));
			let b;
			if (commas === true) {
				b = a.toLocaleString();
			} else {
				b = a.toString();
			}
			return b;
		}

		async function get(url: string): Promise<JSON> {
			const data = await got.get(url).catch((error) => {
				log.warn('PriceCommand', `There was an problem fetching data from <<${url}>> with error:\n${error}`);
				throw 'Error Fetching price data';
			});
			try {
				const json = JSON.parse(data.body);
				return json;
			} catch (error) {
				log.warn('PriceCommand', `There was an problem parsing data from <<${url}>> with error:\n${error}`);
				throw 'json error';
			}
		}
	}
}
