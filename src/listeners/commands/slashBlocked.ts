import { BotListener, type BotCommandHandlerEvents } from '#lib';
import CommandBlockedListener from './commandBlocked.js';

export default class SlashBlockedListener extends BotListener {
	public constructor() {
		super('slashBlocked', {
			emitter: 'commandHandler',
			event: 'slashBlocked'
		});
	}

	public async exec(...[message, command, reason]: BotCommandHandlerEvents['slashBlocked']) {
		return await CommandBlockedListener.handleBlocked(this.client, message, command, reason);
	}
}
