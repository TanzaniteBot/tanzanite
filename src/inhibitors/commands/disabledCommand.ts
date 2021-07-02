import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushInhibitor } from '../../lib/extensions/discord-akairo/BushInhibitor';
import { BushSlashMessage } from '../../lib/extensions/discord-akairo/BushSlashMessage';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';

export default class DisabledCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledCommand', {
			reason: 'disabled',
			type: 'pre',
			priority: 3
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (this.client.isOwner(message.author)) return false;
		if (this.client.cache.global.disabledCommands.includes(command?.id)) {
			this.client.console.debug(`DisabledCommandInhibitor blocked message.`);
			return true;
		}
	}
}
