import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

export default class OwnerInhibitor extends BushInhibitor {
	public constructor() {
		super('owner', {
			reason: 'owner',
			category: 'command',
			type: 'post',
			priority: 100
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (command.ownerOnly) {
			if (!client.isOwner(message.author)) {
				return true;
			}
		}
		return false;
	}
}
