import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import CommandMissingPermissionsListener from './commandMissingPermissions.js';

export default class SlashMissingPermissionsListener extends BotListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashMissingPermissions
		});
	}

	public async exec(...[message, command, type, missing]: BotCommandHandlerEvents[CommandHandlerEvent.SlashMissingPermissions]) {
		return await CommandMissingPermissionsListener.handleMissing(this.client, message, command, type, missing);
	}
}
