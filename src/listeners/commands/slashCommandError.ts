import { BushCommandHandlerEvents, BushListener } from '@lib';
import CommandErrorListener from './commandError';

export default class SlashCommandErrorListener extends BushListener {
	public constructor() {
		super('slashError', {
			emitter: 'commandHandler',
			event: 'slashError',
			category: 'commands'
		});
	}
	async exec(...[error, message, command]: BushCommandHandlerEvents['slashError']): Promise<void> {
		return await CommandErrorListener.handleError(error, message, command);
	}
}
