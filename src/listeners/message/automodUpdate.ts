import { BushListener, BushMessage } from '@lib';
import { AutoMod } from '../../lib/common/AutoMod';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class AutomodMessageUpdateListener extends BushListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'message'
		});
	}

	public override async exec(...[_, newMessage]: BushClientEvents['messageUpdate']): Promise<unknown> {
		const fullMessage = newMessage.partial ? await newMessage.fetch() : (newMessage as BushMessage);
		return new AutoMod(fullMessage);
	}
}
