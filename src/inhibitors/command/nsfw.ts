import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';
import { TextChannel } from 'discord.js';

export default class NsfwInhibitor extends BushInhibitor {
	public constructor() {
		super('nsfw', {
			reason: 'notNsfw',
			category: 'command',
			type: 'post',
			priority: 25
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (command.onlyNsfw && !(message.channel as TextChannel).nsfw) {
			return true;
		}
		return false;
	}
}
