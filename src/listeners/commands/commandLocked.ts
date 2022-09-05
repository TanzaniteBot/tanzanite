import { BotListener, CommandHandlerEvent, Emitter, emojis, format, type BotCommandHandlerEvents } from '#lib';

export default class CommandLockedListener extends BotListener {
	public constructor() {
		super('commandLocked', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.CommandLocked
		});
	}

	public async exec(...[message, command]: BotCommandHandlerEvents[CommandHandlerEvent.CommandLocked]) {
		return message.util.reply(
			`${emojis.error} You cannot use the ${format.input(command.id)} command because it is already in use.`
		);
	}
}
