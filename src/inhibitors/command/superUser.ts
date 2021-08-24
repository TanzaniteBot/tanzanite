import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class SuperUserInhibitor extends BushInhibitor {
	public constructor() {
		super('superUser', {
			reason: 'superUser',
			category: 'command',
			type: 'post',
			priority: 99
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (command.superUserOnly) {
			if (!client.isSuperUser(message.author)) {
				return true;
			}
		}
		return false;
	}
}
