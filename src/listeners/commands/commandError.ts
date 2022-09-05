import { BotListener, CommandHandlerEvent, Emitter, handleCommandError, type BotCommandHandlerEvents } from '#lib';

export default class CommandErrorListener extends BotListener {
	public constructor() {
		super('commandError', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.Error
		});
	}

	public exec(...[error, message, command]: BotCommandHandlerEvents[CommandHandlerEvent.Error]) {
		return handleCommandError(this.client, error, message, command);
	}
}
