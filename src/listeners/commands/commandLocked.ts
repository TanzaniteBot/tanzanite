import { BushListener, emojis, format, type BushCommandHandlerEvents } from '#lib';

export default class CommandLockedListener extends BushListener {
	public constructor() {
		super('commandLocked', {
			emitter: 'commandHandler',
			event: 'commandLocked',
			category: 'commands'
		});
	}

	public async exec(...[message, command]: BushCommandHandlerEvents['commandLocked']) {
		return message.util.reply(
			`${emojis.error} You cannot use the ${format.input(command.id)} command because it is already in use.`
		);
	}
}
