import { BotListener, emojis, format, type BotCommandHandlerEvents } from '#lib';

export default class CommandLockedListener extends BotListener {
	public constructor() {
		super('commandLocked', {
			emitter: 'commandHandler',
			event: 'commandLocked'
		});
	}

	public async exec(...[message, command]: BotCommandHandlerEvents['commandLocked']) {
		return message.util.reply(
			`${emojis.error} You cannot use the ${format.input(command.id)} command because it is already in use.`
		);
	}
}
