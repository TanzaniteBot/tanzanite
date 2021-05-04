import { BushCommand } from '../../lib/extensions/BushCommand';
import BushClient from '../../lib/extensions/BushClient';
import { Message, MessageEmbed } from 'discord.js';
import log from '../../lib/utils/log';
import got from 'got/dist/source';

export default class PriceCommand extends BushCommand {
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
						retry: '<:error:837123021016924261> Choose a valid item.'
					}
				}
				// {
				// 	id: 'strict',
				// 	type: 'flag',
				// 	flag: '--strict'
				// }
			]
		});
	}
	public async exec(message: Message, { item }: { item: string }): Promise<void> {
		let bazaar: JSON,
			currentLowestBIN: JSON,
			averageLowestBIN: JSON,
			auctionAverages: JSON,
			AlmostParsedItem: string,
			client: BushClient,
			priceEmbed: MessageEmbed,
			parsedItem: string;

		try {
			bazaar = await get(`https://api.hypixel.net/skyblock/bazaar?key=${this.client.credentials.hypixelApiKey}`).catch();
			currentLowestBIN = await get('http://moulberry.codes/lowestbin.json');
			averageLowestBIN = await get('http://moulberry.codes/auction_averages_lbin/3day.json');
			auctionAverages = await get('http://moulberry.codes/auction_averages/3day.json'); //formatted differently to currentLowestBIN and averageLowestBIN
			AlmostParsedItem = item.toString().toUpperCase().replace(/ /g, '_').replace(/'S/g, '');
			client = <BushClient>this.client;
			priceEmbed = new MessageEmbed();
			parsedItem = AlmostParsedItem;
		} catch {
			await message.reply('<:error:837123021016924261> There was an error fetching price information.');
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

		const itemIdMap = {
			ADAPTIVE_BLADE: 'STONE_BLADE',
			NECRON_HELMET: 'POWER_WITHER_HELMET',
			NECRON_CHESTPLATE: 'POWER_WITHER_CHESTPLATE',
			NECRON_LEGGINGS: 'POWER_WITHER_LEGGINGS',
			NECRON_BOOTS: 'POWER_WITHER_BOOTS',
			STORM_HELMET: 'WISE_WITHER_HELMET',
			STORM_CHESTPLATE: 'WISE_WITHER_CHESTPLATE',
			STORM_LEGGINGS: 'STORM_LEGGINGS',
			STORM_BOOTS: 'WISE_WITHER_BOOTS',
			MAXOR_HELMET: 'SPEED_WITHER_HELMET',
			MAXOR_CHESTPLATE: 'SPEED_WITHER_CHESTPLATE',
			MAXOR_LEGGINGS: 'SPEED_WITHER_LEGGINGS',
			MAXOR_BOOTS: 'SPEED_WITHER_BOOTS',
			GOLDOR_HELMET: 'TANK_WITHER_HELMET',
			GOLDOR_CHESTPLATE: 'TANK_WITHER_CHESTPLATE',
			GOLDOR_LEGGINGS: 'TANK_WITHER_LEGGINGS',
			GOLDOR_BOOTS: 'TANK_WITHER_BOOTS',
			BONEMERANG: 'BONE_BOOMERANG',
			GOD_POT: 'GOD_POTION',
			AOTD: 'ASPECT_OF_THE_DRAGON',
			AOTE: 'ASPECT_OF_THE_END',
			ROD_OF_CHAMPIONS: 'CHAMP_ROD',
			ROD_OF_LEGENDS: 'LEGEND_ROD',
			CHALLENGING_ROD: 'CHALLENGE_ROD',
			LASR_EYE: 'GIANT_FRAGMENT_LASER',
			DIAMANTE_HANDLE: 'GIANT_FRAGMENT_DIAMOND',
			BIGFOOT_LASSO: 'GIANT_FRAGMENT_BIGFOOT',
			JOLLY_PINK_ROCK: 'GIANT_FRAGMENT_BOULDER',
			HYPER_CATALYST: 'HYPER_CATALYST_UPGRADE',
			ENDER_HELMET: 'END_HELMET',
			ENDER_CHESTPLATE: 'END_CHESTPLATE',
			ENDER_LEGGINGS: 'END_LEGGINGS',
			ENDER_BOOTS: 'END_BOOTS',
			EMPEROR_SKULL: 'DIVER_FRAGMENT',
			COLOSSAL_EXP_BOTTLE: 'COLOSSAL_EXP_BOTTLE_UPGRADE',
			FLYCATCHER: 'FLYCATCHER_UPGRADE'
		};

		if (itemIdMap[parsedItem]) {
			parsedItem = itemIdMap[parsedItem];
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
			const data = await got.get(url).catch(error => {
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
