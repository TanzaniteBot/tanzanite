import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { type TextChannel } from 'discord.js';

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
			void client.console.verbose(
				'notNsfw',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
			);
			return true;
		}
		return false;
	}
}
