import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class DisabledGuildCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledGlobalCommand', {
			reason: 'disabledGlobal',
			category: 'command',
			type: 'post',
			priority: 300
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (message.author.isOwner()) return false;
		if (client.cache.global.disabledCommands?.includes(command?.id)) {
			return true;
		}
		return false;
	}
}
