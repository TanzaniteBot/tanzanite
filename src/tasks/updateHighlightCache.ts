import { Time } from '#constants';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask.js';

export default class UpdateHighlightCacheTask extends BushTask {
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
