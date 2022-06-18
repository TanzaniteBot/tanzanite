import { BushListener, type BushCommandHandlerEvents } from '#lib';
import CommandMissingPermissionsListener from './commandMissingPermissions.js';

export default class SlashMissingPermissionsListener extends BushListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: 'commandHandler',
			event: 'slashMissingPermissions',
			category: 'commands'
		});
	}

	public async exec(...[message, command, type, missing]: BushCommandHandlerEvents['slashMissingPermissions']) {
		return await CommandMissingPermissionsListener.handleMissing(this.client, message, command, type, missing);
	}
}
