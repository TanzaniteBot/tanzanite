import { BushCommandHandlerEvents, BushListener } from '@lib';
import CommandMissingPermissionsListener from './commandMissingPermissions';

export default class SlashMissingPermissionsListener extends BushListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: 'commandHandler',
			event: 'slashMissingPermissions',
			category: 'commands'
		});
	}

	public override async exec(...[message, command, type, missing]: BushCommandHandlerEvents['slashMissingPermissions']) {
		return await CommandMissingPermissionsListener.handleMissing(message, command, type, missing);
	}
}
