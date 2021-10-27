import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class SlashNotFoundListener extends BushListener {
	public constructor() {
		super('slashNotFound', {
			emitter: 'commandHandler',
			event: 'slashNotFound',
			category: 'commands'
		});
	}

	public override async exec(...[interaction]: BushCommandHandlerEvents['slashNotFound']) {
		void client.console.info('slashNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
