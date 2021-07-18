import { Constants } from 'discord-akairo';
import { ColorResolvable, MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import { BushCommand, BushMessage } from '../../lib';

interface Summary {
	amount: number;
	pricePerUnit: number;
	orders: number;
}

interface Bazaar {
	success: boolean;
	lastUpdated: number;
	products: {
		[key: string]: {
			product_id: string;
			sell_summary: Summary[];
			buy_summary: Summary[];
			quick_status: {
				productId: string;
				sellPrice: number;
				sellVolume: number;
				sellMovingWeek: number;
				sellOrders: number;
				buyPrice: number;
				buyVolume: number;
				buyMovingWeek: number;
				buyOrders: number;
			};
		};
	};
}

interface LowestBIN {
	[key: string]: number;
}

interface AuctionAverages {
	[key: string]: {
		price?: number;
		count?: number;
		sales?: number;
		clean_price?: number;
		clean_sales?: number;
	};
}

export default class PriceCommand extends BushCommand {
	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'utilities',
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
					match: Constants.ArgumentMatches.CONTENT,
					type: Constants.ArgumentTypes.STRING,
					prompt: {
						start: 'What item would you like to find the price of?',
						retry: '{error} Choose a valid item.'
					}
				},
				{
					id: 'strict',
					match: Constants.ArgumentMatches.FLAG,
					flag: '--strict',
					default: false
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'item',
					description: 'The item that you would you like to find the price of.',
					type: 'STRING',
					required: true
				},
				{
					name: 'strict',
					description: 'Whether or not to bypass the fuzzy search.',
					type: 'BOOLEAN',
					required: false
				}
			]
		});
	}

	public async exec(message: BushMessage, { item, strict }: { item: string; strict: boolean }): Promise<unknown> {
		const errors = new Array<string>();

		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages]: [Bazaar, LowestBIN, LowestBIN, AuctionAverages] =
			await Promise.all([
				fetch('https://api.hypixel.net/skyblock/bazaar')
					.then((resp) => resp.json())
					.catch(() => errors.push('bazaar')),
				fetch('https://moulberry.codes/lowestbin.json')
					.then((resp) => resp.json())
					.catch(() => errors.push('current lowest BIN')),
				fetch('https://moulberry.codes/auction_averages_lbin/3day.json')
					.then((resp) => resp.json())
					.catch(() => errors.push('average Lowest BIN')),
				fetch('https://moulberry.codes/auction_averages/3day.json')
					.then((resp) => resp.json())
					.catch(() => errors.push('auction average'))
			]);

		let parsedItem = item.toString().toUpperCase().replace(/ /g, '_').replace(/'S/g, '');
		const priceEmbed = new MessageEmbed();

		if (errors?.length) {
			priceEmbed.setFooter(`Could not fetch data from ${this.client.util.oxford(errors, 'and', '')}`);
		}

		//combines all the item names from each
		const itemNames = Array.from(
			new Set(
				(averageLowestBIN ? Object.keys(averageLowestBIN) : []).concat(
					currentLowestBIN ? Object.keys(currentLowestBIN) : [],
					auctionAverages ? Object.keys(auctionAverages) : [],
					bazaar?.products ? Object.keys(bazaar.products) : []
				)
			)
		);

		// fuzzy search
		if (!strict) {
			parsedItem = new Fuse(itemNames)?.search(parsedItem)[0]?.item;
		}

		// If bazaar item then it there should not be any ah data
		if (bazaar['products'][parsedItem]) {
			const bazaarPriceEmbed = new MessageEmbed()
				.setColor(
					errors?.length
						? (this.client.util.emojis.warn as ColorResolvable)
						: (this.client.util.colors.success as ColorResolvable)
				)
				.setTitle(`Bazaar Information for \`${parsedItem}\``)
				.addField('Sell Price', Bazaar('sellPrice', 2, true))
				.addField('Buy Price', Bazaar('buyPrice', 2, true))
				.addField('Margin', (Number(Bazaar('buyPrice', 2, false)) - Number(Bazaar('sellPrice', 2, false))).toLocaleString())
				.addField('Current Sell Orders', Bazaar('sellOrders', 0, true))
				.addField('Current Buy Orders', Bazaar('buyOrders', 0, true));
			return await message.util.reply({ embeds: [bazaarPriceEmbed] });
		}

		// Checks if the item exists in any of the action information otherwise it is not a valid item
		if (currentLowestBIN?.[parsedItem] || averageLowestBIN?.[parsedItem] || auctionAverages?.[parsedItem]) {
			priceEmbed
				.setColor(this.client.util.colors.success)
				.setTitle(`Price Information for \`${parsedItem}\``)
				.setFooter('All information is based on the last 3 days.');
		} else {
			const errorEmbed = new MessageEmbed();
			errorEmbed
				.setColor(this.client.util.colors.error)
				.setDescription(
					`${this.client.util.emojis.error} \`${parsedItem}\` is not a valid item id, or it has no auction data.`
				);
			return await message.util.reply({ embeds: [errorEmbed] });
		}

		if (currentLowestBIN?.[parsedItem]) {
			const currentLowestBINPrice = currentLowestBIN[parsedItem].toLocaleString();
			priceEmbed.addField('Current Lowest BIN', currentLowestBINPrice);
		}
		if (averageLowestBIN?.[parsedItem]) {
			const averageLowestBINPrice = averageLowestBIN[parsedItem].toLocaleString();
			priceEmbed.addField('Average Lowest BIN', averageLowestBINPrice);
		}
		if (auctionAverages?.[parsedItem]?.price) {
			const auctionAveragesPrice = auctionAverages[parsedItem].price.toLocaleString();
			priceEmbed.addField('Average Auction Price', auctionAveragesPrice);
		}
		if (auctionAverages?.[parsedItem]?.count) {
			const auctionAveragesCountPrice = auctionAverages[parsedItem].count.toLocaleString();
			priceEmbed.addField('Average Auction Count', auctionAveragesCountPrice);
		}
		if (auctionAverages?.[parsedItem]?.sales) {
			const auctionAveragesSalesPrice = auctionAverages[parsedItem].sales.toLocaleString();
			priceEmbed.addField('Average Auction Sales', auctionAveragesSalesPrice);
		}
		if (auctionAverages?.[parsedItem]?.clean_price) {
			const auctionAveragesCleanPrice = auctionAverages[parsedItem].clean_price.toLocaleString();
			priceEmbed.addField('Average Auction Clean Price', auctionAveragesCleanPrice);
		}
		if (auctionAverages?.[parsedItem]?.clean_sales) {
			const auctionAveragesCleanSales = auctionAverages[parsedItem].clean_sales.toLocaleString();
			priceEmbed.addField('Average Auction Clean Sales', auctionAveragesCleanSales);
		}
		return await message.util.reply({ embeds: [priceEmbed] });

		//Helper functions
		function Bazaar(Information: string, digits: number, commas: boolean): string {
			const price = bazaar?.products[parsedItem]?.quick_status?.[Information];
			const a = Number(Number(price).toFixed(digits));
			return commas ? a?.toLocaleString() : a?.toString();
		}
	}
}
