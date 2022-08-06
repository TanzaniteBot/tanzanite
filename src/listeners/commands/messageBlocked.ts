import { BushListener, type BushCommandHandlerEvents } from '#lib';

export default class MessageBlockedListener extends BushListener {
	public constructor() {
		super('messageBlocked', {
			emitter: 'commandHandler',
			event: 'messageBlocked',
			category: 'commands'
		});
	}

	public async exec(...[message, reason]: BushCommandHandlerEvents['messageBlocked']) {
		if (['client', 'bot'].includes(reason)) return;
		// return await CommandBlockedListener.handleBlocked(message as Message, null, reason);
		return void this.client.console.verbose(
			`messageBlocked`,
			`<<${message.author.tag}>>'s message was blocked because ${reason}`
		);
	}
}
