import { BushListener, handleCommandError, type BushCommandHandlerEvents } from '#lib';

export default class CommandErrorListener extends BushListener {
	public constructor() {
		super('commandError', {
			emitter: 'commandHandler',
			event: 'error',
			category: 'commands'
		});
	}

	public exec(...[error, message, command]: BushCommandHandlerEvents['error']) {
		return handleCommandError(this.client, error, message, command);
	}
}
