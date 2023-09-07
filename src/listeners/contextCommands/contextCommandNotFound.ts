import { BotListener, ContextCommandHandlerEvent, Emitter } from '#lib';
import type { ContextMenuCommandHandlerEvents } from '@tanzanite/discord-akairo';

export default class ContextCommandNotFoundListener extends BotListener {
	public constructor() {
		super('contextCommandNotFound', {
			emitter: Emitter.ContextMenuCommandHandler,
			event: ContextCommandHandlerEvent.NotFound
		});
	}

	public async exec(...[interaction]: ContextMenuCommandHandlerEvents[ContextCommandHandlerEvent.NotFound]) {
		void this.client.console.info('contextCommandNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
