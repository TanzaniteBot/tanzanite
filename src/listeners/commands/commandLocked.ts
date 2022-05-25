import { BushListener, type BushCommandHandlerEvents } from '#lib';

export default class CommandLockedListener extends BushListener {
	public constructor() {
		super('commandLocked', {
			emitter: 'commandHandler',
			event: 'commandLocked',
			category: 'commands'
		});
	}

	public override async exec(...[message, command]: BushCommandHandlerEvents['commandLocked']) {
		return message.util.reply(
			`${util.emojis.error} You cannot use the ${util.format.input(command.id)} command because it is already in use.`
		);
	}
}
