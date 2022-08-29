import { BotListener, handleCommandError, type BotCommandHandlerEvents } from '#lib';

export default class CommandErrorListener extends BotListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error'
		});
	}

	public exec(...[error, message, command]: BotCommandHandlerEvents['error']) {
		return handleCommandError(this.client, error, message, command);
	}
}
