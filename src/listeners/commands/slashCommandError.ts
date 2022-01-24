import { BushListener, type BushCommandHandlerEvents } from '#lib';
import CommandErrorListener from './commandError.js';

export default class SlashCommandErrorListener extends BushListener {
	public constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError',
			category: 'commands'
		});
	}

	public override async exec(...[error, message, command]: BushCommandHandlerEvents['slashError']) {
		return await CommandErrorListener.handleError(error, message, command);
	}
}
