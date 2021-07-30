import { BushCommandHandlerEvents, BushListener } from '@lib';
import CommandBlockedListener from './commandBlocked';

export default class SlashBlockedListener extends BushListener {
	public constructor() {
		super('slashBlocked', {
			emitter: 'commandHandler',
			event: 'slashBlocked',
			category: 'commands'
		});
	}

	public async exec(...[message, command, reason]: BushCommandHandlerEvents['slashBlocked']): Promise<unknown> {
		return await CommandBlockedListener.handleBlocked(message, command, reason);
	}
}
