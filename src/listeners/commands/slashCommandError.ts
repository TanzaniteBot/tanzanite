import { BotListener, handleCommandError, type BotCommandHandlerEvents } from '#lib';

export default class SlashCommandErrorListener extends BotListener {
	public constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError'
		});
	}

	public async exec(...[error, message, command]: BotCommandHandlerEvents['slashError']) {
		return await handleCommandError(this.client, error, message, command);
	}
}
