import { BushListener } from '@lib';
import { AutoMod } from '../../lib/common/AutoMod';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']): Promise<unknown> {
		return new AutoMod(message);
	}
}
