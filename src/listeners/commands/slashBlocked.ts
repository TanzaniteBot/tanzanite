import { BushListener, type BushCommandHandlerEvents } from '#lib';
import CommandBlockedListener from './commandBlocked.js';

export default class SlashBlockedListener extends BushListener {
	public constructor() {
		super('slashBlocked', {
			emitter: 'commandHandler',
			event: 'slashBlocked',
			category: 'commands'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['slashBlocked']) {
		return await CommandBlockedListener.handleBlocked(message, command, reason);
	}
}
