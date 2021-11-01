import { BushListener, type BushCommandHandlerEvents } from '@lib';

export default class MessageBlockedListener extends BushListener {
	public constructor() {
		super('messageBlocked', {
			emitter: 'commandHandler',
			event: 'messageBlocked'
		});
	}

	public override async exec(...[message, reason]: BushCommandHandlerEvents['messageBlocked']) {
		const reasons = client.consts.BlockedReasons;
		if ([reasons.CLIENT, reasons.BOT].includes(reason)) return;
		// return await CommandBlockedListener.handleBlocked(message as Message, null, reason);
		return void client.console.verbose(`messageBlocked`, `<<${message.author.tag}>>'s message was blocked because ${reason}`);
	}
}
