import { BotTask, Time } from '#lib';

export default class UpdateHighlightCacheTask extends BotTask {
	public constructor() {
		super('updateHighlightCache', {
			delay: 5 * Time.Minute,
			runOnStart: false
		});
	}

	public async exec() {
		return this.client.highlightManager.syncCache();
	}
}
