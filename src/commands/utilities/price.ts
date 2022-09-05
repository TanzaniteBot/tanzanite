import { ArgType, BotCommand, colors, emojis, format, oxford, type CommandMessage } from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, AutocompleteInteraction, EmbedBuilder } from 'discord.js';
import { default as Fuse } from 'fuse.js';

assert(Fuse);

export default class PriceCommand extends BotCommand {
	public static cachedItemList: string[] = [];
	public static readonly urls = [
		{ url: 'https://api.hypixel.net/skyblock/bazaar', error: 'bazaar' },
		{ url: 'https://moulberry.codes/lowestbin.json', error: 'current lowest BIN' },
		{ url: 'https://moulberry.codes/auction_averages_lbin/3day.json', error: 'average Lowest BIN' },
		{ url: 'https://moulberry.codes/auction_averages/3day.json', error: 'auction average' }
	] as const;

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
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			typing: true
		});
	}

	public override async exec(message: CommandMessage, args: { item: ArgType<'string'>; strict: ArgType<'flag'> }) {
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();
		const errors: string[] = [];

		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages] = (await Promise.all(
			PriceCommand.urls.map(({ url, error }) =>
				fetch(url)
					.then((p) => (p.ok ? p.json() : undefined))
					.catch(() => (errors.push(error), undefined))
			)
		)) as [Bazaar?, LowestBIN?, LowestBIN?, AuctionAverages?];

		let parsedItem = args.item.toString().toUpperCase().replace(/ /g, '_').replace(/'S/g, '');
		const priceEmbed = new EmbedBuilder().setColor(errors?.length ? colors.warn : colors.success).setTimestamp();

		if (bazaar?.success === false) errors.push('bazaar');

		if (errors.length) {
			priceEmbed.setFooter({ text: `Could not fetch data for ${oxford(errors, 'and')}` });
		}

		// create a set from all the item names so that there are no duplicates for the fuzzy search
		const itemNames = new Set([
			...Object.keys(averageLowestBIN ?? {}),
			...Object.keys(currentLowestBIN ?? {}),
			...Object.keys(auctionAverages ?? {}),
			...Object.keys(bazaar?.products ?? {})
		]);

		// fuzzy search
		if (!args.strict) {
			parsedItem = new Fuse([...itemNames], {
				isCaseSensitive: false,
				findAllMatches: true,
				threshold: 0.7,
				ignoreLocation: true
			})?.search(parsedItem)[0]?.item;
		}

		// if its a bazaar item then it there should not be any ah data
		if (bazaar?.products?.[parsedItem]) {
			priceEmbed.setTitle(`Bazaar Information for ${format.input(parsedItem)}`).addFields(
				{ name: 'Sell Price', value: addBazaarInformation('sellPrice', 2, true) },
				{ name: 'Buy Price', value: addBazaarInformation('buyPrice', 2, true) },
				{
					name: 'Margin',
					value: (
						Number(addBazaarInformation('buyPrice', 2, false)) - Number(addBazaarInformation('sellPrice', 2, false))
					).toLocaleString()
				},
				{ name: 'Current Sell Orders', value: addBazaarInformation('sellOrders', 0, true) },
				{ name: 'Current Buy Orders', value: addBazaarInformation('buyOrders', 0, true) }
			);
			return await message.util.reply({ embeds: [priceEmbed] });
		}

		// checks if the item exists in any of the action information otherwise it is not a valid item
		if (currentLowestBIN?.[parsedItem] || averageLowestBIN?.[parsedItem] || auctionAverages?.[parsedItem]) {
			priceEmbed.setTitle(`Price Information for ${format.input(parsedItem)}`).setFooter({
				text: `${
					priceEmbed.data.footer?.text ? `${priceEmbed.data.footer.text} | ` : ''
				}All information is based on the last 3 days.`
			});
		} else {
			const errorEmbed = new EmbedBuilder();
			errorEmbed
				.setColor(colors.error)
				.setDescription(`${emojis.error} ${format.input(parsedItem)} is not a valid item id, or it has no auction data.`);
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

		function addBazaarInformation(Information: keyof BazarProductQuickStatus, digits: number, commas: boolean): string {
			const price = bazaar?.products?.[parsedItem]?.quick_status?.[Information];
			return commas
				? Number(price)?.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })
				: Number(price)?.toFixed(digits);
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

export type ItemID = string;

export interface Bazaar {
	success: boolean;
	lastUpdated: number;
	products: {
		[key: ItemID]: BazarProduct;
	};
}

export interface BazarProduct {
	product_id: string;
	sell_summary: BazarSummary[];
	buy_summary: BazarSummary[];
	quick_status: BazarProductQuickStatus;
}

export interface BazarSummary {
	amount: number;
	pricePerUnit: number;
	orders: number;
}

export interface BazarProductQuickStatus {
	productId: ItemID;
	sellPrice: number;
	sellVolume: number;
	sellMovingWeek: number;
	sellOrders: number;
	buyPrice: number;
	buyVolume: number;
	buyMovingWeek: number;
	buyOrders: number;
}

export interface LowestBIN {
	[key: ItemID]: number;
}

export interface AuctionAverages {
	[key: ItemID]: {
		price?: number;
		count?: number;
		sales?: number;
		clean_price?: number;
		clean_sales?: number;
	};
}
