import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import CommandBlockedListener from './commandBlocked.js';

export default class SlashBlockedListener extends BotListener {
	public constructor() {
		super('slashBlocked', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashBlocked
		});
	}

	public async exec(...[message, command, reason]: BotCommandHandlerEvents[CommandHandlerEvent.SlashBlocked]) {
		return await CommandBlockedListener.handleBlocked(this.client, message, command, reason);
	}
}
