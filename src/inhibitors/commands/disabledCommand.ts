import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushInhibitor } from '../../lib/extensions/BushInhibitor';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushMessage } from '../../lib/extensions/BushMessage';

export default class DisabledCommandInhibitor extends BushInhibitor {
	constructor() {
		super('disabledCommand', {
			reason: 'disabled',
			type: 'pre',
			priority: 3
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (this.client.isOwner(message.author)) return false;
		return this.client.cache.global.disabledCommands.includes(command?.id);
	}
}
