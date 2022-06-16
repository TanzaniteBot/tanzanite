import { BushListener } from '#lib';
import { type ContextMenuCommandHandlerEvents } from 'discord-akairo';

export default class ContextCommandNotFoundListener extends BushListener {
	public constructor() {
		super('contextCommandNotFound', {
			emitter: 'contextMenuCommandHandler',
			event: 'notFound',
			category: 'contextCommands'
		});
	}

	public async exec(...[interaction]: ContextMenuCommandHandlerEvents['notFound']) {
		void client.console.info('contextCommandNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
