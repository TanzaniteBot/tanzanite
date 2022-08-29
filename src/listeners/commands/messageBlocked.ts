import { BotListener, type BotCommandHandlerEvents } from '#lib';

export default class MessageBlockedListener extends BotListener {
	public constructor() {
		super('messageBlocked', {
			emitter: 'commandHandler',
			event: 'messageBlocked'
		});
	}

	public async exec(...[message, reason]: BotCommandHandlerEvents['messageBlocked']) {
		if (['client', 'bot'].includes(reason)) return;
		// return await CommandBlockedListener.handleBlocked(message as Message, null, reason);
		return void this.client.console.verbose(
			`messageBlocked`,
			`<<${message.author.tag}>>'s message was blocked because ${reason}`
		);
	}
}
