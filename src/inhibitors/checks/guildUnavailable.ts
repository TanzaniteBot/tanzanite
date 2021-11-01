import { BushInhibitor, type BushMessage, type BushSlashMessage } from '@lib';

export default class GuildUnavailableInhibitor extends BushInhibitor {
	public constructor() {
		super('guildUnavailable', {
			reason: 'guildUnavailable',
			type: 'all',
			category: 'checks',
			priority: 70
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<boolean> {
		if (message.guild && !message.guild.available) {
			return true;
		}
		return false;
	}
}
