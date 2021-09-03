import { CommandInteraction, MessageEmbed } from 'discord.js';
import Fuse from 'fuse.js';
import fetch from 'node-fetch';
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

type Results = [Promise<Bazaar>, Promise<LowestBIN>, Promise<LowestBIN>, Promise<AuctionAverages>];

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
					type: 'string',
					match: 'content',
					prompt: {
						start: 'What item would you like to find the price of?',
						retry: '{error} Choose a valid item.'
					}
				},
				{
					id: 'strict',
					match: 'flag',
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

	public override async exec(message: BushMessage, { item, strict }: { item: string; strict: boolean }): Promise<unknown> {
		if (message.util.isSlash) await (message.interaction as CommandInteraction).deferReply();
		const errors = new Array<string>();

		const promises = (
			await Promise.all([
				fetch('https://api.hypixel.net/skyblock/bazaar').catch(() => errors.push('bazaar')),
				fetch('https://moulberry.codes/lowestbin.json').catch(() => errors.push('current lowest BIN')),
				fetch('https://moulberry.codes/auction_averages_lbin/3day.json').catch(() => errors.push('average Lowest BIN')),
				fetch('https://moulberry.codes/auction_averages/3day.json').catch(() => errors.push('auction average'))
			])
		).map(async (request) => await (typeof request === 'number' ? null : request.json())) as unknown as Results;

		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages] = await Promise.all(promises);

		let parsedItem = item.toString().toUpperCase().replace(/ /g, '_').replace(/'S/g, '');
		const priceEmbed = new MessageEmbed();

		if (bazaar?.success === false) errors.push('bazaar');

		if (errors?.length) {
			priceEmbed.setFooter(`Could not fetch data from ${util.oxford(errors, 'and', '')}`);
		}

		// create a set from all the item names so that there are no duplicates for the fuzzy search
		const itemNames = new Set([
			...Object.keys(averageLowestBIN || {}),
			...Object.keys(currentLowestBIN || {}),
			...Object.keys(auctionAverages || {}),
			...Object.keys(bazaar?.products || {})
		]);

		// fuzzy search
		if (!strict) {
			const _ = new Fuse(Array.from(itemNames), {
				isCaseSensitive: false,
				findAllMatches: true,
				threshold: 0.7,
				ignoreLocation: true
			})?.search(parsedItem);
			client.console.debug(_, 4);
			parsedItem = _[0]?.item;
		}

		// if its a bazaar item then it there should not be any ah data
		if (bazaar['products']?.[parsedItem]) {
			const bazaarPriceEmbed = new MessageEmbed()
				.setColor(errors?.length ? util.colors.warn : util.colors.success)
				.setTitle(`Bazaar Information for **${parsedItem}**`)
				.addField('Sell Price', addBazaarInformation('sellPrice', 2, true))
				.addField('Buy Price', addBazaarInformation('buyPrice', 2, true))
				.addField(
					'Margin',
					(+addBazaarInformation('buyPrice', 2, false) - +addBazaarInformation('sellPrice', 2, false)).toLocaleString()
				)
				.addField('Current Sell Orders', addBazaarInformation('sellOrders', 0, true))
				.addField('Current Buy Orders', addBazaarInformation('buyOrders', 0, true));
			return await message.util.reply({ embeds: [bazaarPriceEmbed] });
		}

		// checks if the item exists in any of the action information otherwise it is not a valid item
		if (currentLowestBIN?.[parsedItem] || averageLowestBIN?.[parsedItem] || auctionAverages?.[parsedItem]) {
			priceEmbed
				.setColor(util.colors.success)
				.setTitle(`Price Information for \`${parsedItem}\``)
				.setFooter('All information is based on the last 3 days.');
		} else {
			const errorEmbed = new MessageEmbed();
			errorEmbed
				.setColor(util.colors.error)
				.setDescription(`${util.emojis.error} \`${parsedItem}\` is not a valid item id, or it has no auction data.`);
			return await message.util.reply({ embeds: [errorEmbed] });
		}

		addPrice('Current Lowest BIN', currentLowestBIN?.[parsedItem]);
		addPrice('Average Lowest BIN', averageLowestBIN?.[parsedItem]);
		addPrice('Average Auction Price', auctionAverages?.[parsedItem]?.price);
		addPrice('Average Auction Count', auctionAverages?.[parsedItem]?.count);
		addPrice('Average Auction Sales', auctionAverages?.[parsedItem]?.sales);
		addPrice('Average Auction Clean Price', auctionAverages?.[parsedItem]?.clean_price);
		addPrice('Average Auction Clean Sales', auctionAverages?.[parsedItem]?.clean_sales);

		return await message.util.reply({ embeds: [priceEmbed] });

		// helper functions
		function addBazaarInformation(
			Information: keyof Bazaar['products'][string]['quick_status'],
			digits: number,
			commas: boolean
		): string {
			const price = bazaar?.products?.[parsedItem]?.quick_status?.[Information];
			const roundedPrice = Number(Number(price).toFixed(digits));
			return commas ? roundedPrice?.toLocaleString() : roundedPrice?.toString();
		}
		function addPrice(name: string, price: number | undefined) {
			if (price) priceEmbed.addField(name, price.toFixed(2).toLocaleString());
		}
	}
}
