import { BotListener, type BotCommandHandlerEvents } from '#lib';

export default class SlashNotFoundListener extends BotListener {
	public constructor() {
		super('slashNotFound', {
			emitter: 'commandHandler',
			event: 'slashNotFound'
		});
	}

	public async exec(...[interaction]: BotCommandHandlerEvents['slashNotFound']) {
		void this.client.console.info('slashNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
