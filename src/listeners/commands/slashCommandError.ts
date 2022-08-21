import { BushListener, handleCommandError, type BushCommandHandlerEvents } from '#lib';

export default class SlashCommandErrorListener extends BushListener {
	public constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError',
			category: 'commands'
		});
	}

	public async exec(...[error, message, command]: BushCommandHandlerEvents['slashError']) {
		return await handleCommandError(this.client, error, message, command);
	}
}
