import { BushListener, type BushCommandHandlerEvents } from '#lib';

export default class SlashNotFoundListener extends BushListener {
	public constructor() {
		super('slashNotFound', {
			emitter: 'commandHandler',
			event: 'slashNotFound',
			category: 'commands'
		});
	}

	public async exec(...[interaction]: BushCommandHandlerEvents['slashNotFound']) {
		void this.client.console.info('slashNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
