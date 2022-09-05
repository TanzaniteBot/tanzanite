import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';

export default class MessageBlockedListener extends BotListener {
	public constructor() {
		super('messageBlocked', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.MessageBlocked
		});
	}

	public async exec(...[message, reason]: BotCommandHandlerEvents[CommandHandlerEvent.MessageBlocked]) {
		if (['client', 'bot'].includes(reason)) return;
		// return await CommandBlockedListener.handleBlocked(message as Message, null, reason);
		return void this.client.console.verbose(
			`messageBlocked`,
			`<<${message.author.tag}>>'s message was blocked because ${reason}`
		);
	}
}
