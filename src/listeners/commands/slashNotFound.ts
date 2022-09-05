import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';

export default class SlashNotFoundListener extends BotListener {
	public constructor() {
		super('slashNotFound', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashNotFound
		});
	}

	public async exec(...[interaction]: BotCommandHandlerEvents[CommandHandlerEvent.SlashNotFound]) {
		void this.client.console.info('slashNotFound', `<<${interaction?.commandName}>> could not be found.`);
	}
}
