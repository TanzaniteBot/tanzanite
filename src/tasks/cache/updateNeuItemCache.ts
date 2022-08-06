import { BushTask, Time } from '#lib';

export default class UpdateNeuItemCache extends BushTask {
	public constructor() {
		super('updateNeuItemCache', {
			delay: 1 * Time.Hour,
			runOnStart: true
		});
	}

	public async exec() {}
}
