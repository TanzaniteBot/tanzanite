import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

export default class GuildInhibitor extends BushInhibitor {
	public constructor() {
		super('guild', {
			reason: 'guild',
			category: 'command',
			type: 'post',
			priority: 80
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (command.channel === 'guild' && !message.guild) {
			return true;
		}
		return false;
	}
}
