import { BushTask, Time } from '#lib';

export default class UpdatePriceItemCache extends BushTask {
	public constructor() {
		super('updatePriceItemCache', {
			delay: 1 * Time.Hour,
			runOnStart: true
		});
	}

	public async exec() {}
}
