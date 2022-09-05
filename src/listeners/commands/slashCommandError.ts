import { BotListener, CommandHandlerEvent, Emitter, handleCommandError, type BotCommandHandlerEvents } from '#lib';

export default class SlashCommandErrorListener extends BotListener {
	public constructor() {
		super('slashError', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashError
		});
	}

	public async exec(...[error, message, command]: BotCommandHandlerEvents[CommandHandlerEvent.SlashError]) {
		return await handleCommandError(this.client, error, message, command);
	}
}
