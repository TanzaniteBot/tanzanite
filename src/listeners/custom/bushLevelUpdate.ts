import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class BushLevelUpdateListener extends BushListener {
	public constructor() {
		super('bushLevelUpdate', {
			emitter: 'client',
			event: 'bushLevelUpdate',
			category: 'custom'
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override async exec(...[member, oldLevel, newLevel, currentXp]: BushClientEvents['bushLevelUpdate']) {
		//
	}
}
