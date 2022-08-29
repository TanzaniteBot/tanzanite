import { BotListener, type BotCommandHandlerEvents } from '#lib';
import CommandMissingPermissionsListener from './commandMissingPermissions.js';

export default class SlashMissingPermissionsListener extends BotListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: 'commandHandler',
			event: 'slashMissingPermissions'
		});
	}

	public async exec(...[message, command, type, missing]: BotCommandHandlerEvents['slashMissingPermissions']) {
		return await CommandMissingPermissionsListener.handleMissing(this.client, message, command, type, missing);
	}
}
