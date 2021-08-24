import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class RestrictedGuildInhibitor extends BushInhibitor {
	public constructor() {
		super('restrictedGuild', {
			reason: 'restrictedGuild',
			category: 'command',
			type: 'post',
			priority: 5
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				return true;
			}
		}
		return false;
	}
}
