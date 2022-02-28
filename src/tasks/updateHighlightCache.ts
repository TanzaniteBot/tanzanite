import { Time } from '#constants';
import { BushTask } from '../lib/extensions/discord-akairo/BushTask.js';

export default class UpdateHighlightCacheTask extends BushTask {
	public constructor() {
		super('updateHighlightCache', {
			delay: 5 * Time.Minute,
			runOnStart: false
		});
	}

	public override async exec() {
		return client.highlightManager.syncCache();
	}
}
