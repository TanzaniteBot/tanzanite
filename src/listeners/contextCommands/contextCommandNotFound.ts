import { BotListener } from '#lib';
import { type ContextMenuCommandHandlerEvents } from 'discord-akairo';

export default class ContextCommandNotFoundListener extends BotListener {
	public constructor() {
		super('contextCommandNotFound', {
			emitter: 'contextMenuCommandHandler',
			event: 'notFound'
		});
	}

	public async exec(...[interaction]: ContextMenuCommandHandlerEvents['notFound']) {
		void this.client.console.info('contextCommandNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
