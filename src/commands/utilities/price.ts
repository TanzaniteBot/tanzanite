import { BushCommand, type BushMessage } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, AutocompleteInteraction, Embed, PermissionFlagsBits } from 'discord.js';
import Fuse from 'fuse.js';
import got from 'got';

assert(Fuse);
assert(got);

export default class PriceCommand extends BushCommand {
	public static cachedItemList: string[] = [];

	public constructor() {
		super('price', {
			aliases: ['price'],
			category: 'utilities',
			description: 'Finds the price information of an item.',
			usage: ['price <item> [--strict]'],
			examples: ['price ASPECT_OF_THE_END'],
			args: [
				{
					id: 'item',
					description: 'The item that you would you like to find the price of.',
					type: 'string',
					match: 'content',
					prompt: 'What item would you like to find the price of?',
					retry: '{error} Choose a valid item.',
					slashType: ApplicationCommandOptionType.String,
					autocomplete: true
				},
				{
					id: 'strict',
					description: 'Whether or not to bypass the fuzzy search.',
					match: 'flag',
					flag: '--strict',
					prompt: 'Would you like to bypass the fuzzy search?',
					optional: true,
					slashType: ApplicationCommandOptionType.Boolean
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			typing: true
		});
	}

	public override async exec(message: BushMessage, { item, strict }: { item: string; strict: boolean }) {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();
		const errors: string[] = [];

		//prettier-ignore
		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages] = (await Promise.all([
			got.get('https://api.hypixel.net/skyblock/bazaar').json().catch(() => { errors.push('bazaar') }),
			got.get('https://moulberry.codes/lowestbin.json').json().catch(() => { errors.push('current lowest BIN') }),
			got.get('https://moulberry.codes/auction_averages_lbin/3day.json').json().catch(() => { errors.push('average Lowest BIN') }),
			got.get('https://moulberry.codes/auction_averages/3day.json').json().catch(() => { errors.push('auction average') })
		])) as [Bazaar, LowestBIN, LowestBIN, AuctionAverages];

		let parsedItem = item.toString().toUpperCase().replace(/ /g, '_').replace(/'S/g, '');
		const priceEmbed = new Embed();

		if (bazaar?.success === false) errors.push('bazaar');

		if (errors?.length) {
			priceEmbed.setFooter({ text: `Could not fetch data from ${util.oxford(errors, 'and', '')}` });
		}

		// create a set from all the item names so that there are no duplicates for the fuzzy search
		const itemNames = new Set([
			...Object.keys(averageLowestBIN ?? {}),
			...Object.keys(currentLowestBIN ?? {}),
			...Object.keys(auctionAverages ?? {}),
			...Object.keys(bazaar?.products ?? {})
		]);

		// fuzzy search
		if (!strict) {
			parsedItem = new Fuse([...itemNames], {
				isCaseSensitive: false,
				findAllMatches: true,
				threshold: 0.7,
				ignoreLocation: true
			})?.search(parsedItem)[0]?.item;
		}

		// if its a bazaar item then it there should not be any ah data
		if (bazaar.products?.[parsedItem]) {
			const bazaarPriceEmbed = new Embed()
				.setColor(errors?.length ? util.colors.warn : util.colors.success)
				.setTitle(`Bazaar Information for ${util.format.input(parsedItem)}`)
				.addFields({ name: 'Sell Price', value: addBazaarInformation('sellPrice', 2, true) })
				.addFields({ name: 'Buy Price', value: addBazaarInformation('buyPrice', 2, true) })
				.addFields({
					name: 'Margin',
					value: (+addBazaarInformation('buyPrice', 2, false) - +addBazaarInformation('sellPrice', 2, false)).toLocaleString()
				})
				.addFields({ name: 'Current Sell Orders', value: addBazaarInformation('sellOrders', 0, true) })
				.addFields({ name: 'Current Buy Orders', value: addBazaarInformation('buyOrders', 0, true) });
			return await message.util.reply({ embeds: [bazaarPriceEmbed] });
		}

		// checks if the item exists in any of the action information otherwise it is not a valid item
		if (currentLowestBIN?.[parsedItem] || averageLowestBIN?.[parsedItem] || auctionAverages?.[parsedItem]) {
			priceEmbed
				.setColor(util.colors.success)
				.setTitle(`Price Information for ${util.format.input(parsedItem)}`)
				.setFooter({ text: 'All information is based on the last 3 days.' });
		} else {
			const errorEmbed = new Embed();
			errorEmbed
				.setColor(util.colors.error)
				.setDescription(
					`${util.emojis.error} ${util.format.input(parsedItem)} is not a valid item id, or it has no auction data.`
				);
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

		function addBazaarInformation(
			Information: keyof Bazaar['products'][string]['quick_status'],
			digits: number,
			commas: boolean
		): string {
			const price = bazaar?.products?.[parsedItem]?.quick_status?.[Information];
			return commas
				? (+price)?.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
				: (+price)?.toFixed(digits);
		}
		function addPrice(name: string, price: number | undefined) {
			if (price)
				priceEmbed.addFields({
					name: name,
					value: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
				});
		}
	}

	public override autocomplete(interaction: AutocompleteInteraction) {
		const fuzzy = new Fuse(PriceCommand.cachedItemList, {
			threshold: 0.5,
			isCaseSensitive: false,
			findAllMatches: true
		}).search(interaction.options.getFocused().toString());

		const res = fuzzy.slice(0, fuzzy.length >= 25 ? 25 : undefined).map((v) => ({ name: v.item, value: v.item }));

		void interaction.respond(res);
	}
}

export interface Summary {
	amount: number;
	pricePerUnit: number;
	orders: number;
}

export interface Bazaar {
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

export interface LowestBIN {
	[key: string]: number;
}

export interface AuctionAverages {
	[key: string]: {
		price?: number;
		count?: number;
		sales?: number;
		clean_price?: number;
		clean_sales?: number;
	};
}
