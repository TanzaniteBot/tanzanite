import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class DisabledGuildCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledGlobalCommand', {
			reason: 'disabledGlobal',
			type: 'pre',
			priority: 4
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (message.author.isOwner()) return false;
		if (client.cache.global.disabledCommands?.includes(command?.id)) {
			client.console.debug(`disabledGlobalCommand blocked message.`);
			return true;
		}
	}
}
