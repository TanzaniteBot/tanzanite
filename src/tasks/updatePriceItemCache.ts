import { BushTask, Time } from '#lib';
import got from 'got';
import PriceCommand, { AuctionAverages, Bazaar, LowestBIN } from '../commands/utilities/price.js';

export default class UpdatePriceItemCache extends BushTask {
	public constructor() {
		super('updatePriceItemCache', {
			delay: 10 * Time.Minute,
			runOnStart: true
		});
	}

	public override async exec() {
		//prettier-ignore
		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages] = (await Promise.all([
			got.get('https://api.hypixel.net/skyblock/bazaar').json().catch(() => {}),
			got.get('https://moulberry.codes/lowestbin.json').json().catch(() => {}),
			got.get('https://moulberry.codes/auction_averages_lbin/3day.json').json().catch(() => {}),
			got.get('https://moulberry.codes/auction_averages/3day.json').json().catch(() => {})
		])) as [Bazaar, LowestBIN, LowestBIN, AuctionAverages];

		const itemNames = new Set([
			...Object.keys(averageLowestBIN ?? {}),
			...Object.keys(currentLowestBIN ?? {}),
			...Object.keys(auctionAverages ?? {}),
			...Object.keys(bazaar?.products ?? {})
		]);

		PriceCommand.cachedItemList = [...itemNames];
	}
}
