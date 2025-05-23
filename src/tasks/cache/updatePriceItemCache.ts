import { BotTask, Time } from '#lib';
import PriceCommand, { type AuctionAverages, type Bazaar, type LowestBIN } from '../../commands/moulberry-bush/price.js';

export default class UpdatePriceItemCache extends BotTask {
	public constructor() {
		super('updatePriceItemCache', {
			delay: 10 * Time.Minute,
			runOnStart: true
		});
	}

	public async exec() {
		const [bazaar, currentLowestBIN, averageLowestBIN, auctionAverages] = (await Promise.all(
			PriceCommand.urls.map(({ url }) =>
				fetch(url)
					.then((p) => (p.ok ? p.json() : undefined))
					.catch(() => undefined)
			)
		)) as [Bazaar?, LowestBIN?, LowestBIN?, AuctionAverages?];

		const itemNames = new Set([
			...Object.keys(averageLowestBIN ?? {}),
			...Object.keys(currentLowestBIN ?? {}),
			...Object.keys(auctionAverages ?? {}),
			...Object.keys(bazaar?.products ?? {})
		]);

		PriceCommand.cachedItemList = [...itemNames];
	}
}
