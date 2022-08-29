import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class OwnerInhibitor extends BotInhibitor {
	public constructor() {
		super('owner', {
			reason: 'owner',
			type: 'post',
			priority: 100
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.ownerOnly) {
			if (!this.client.isOwner(message.author)) {
				void this.client.console.verbose(
					'owner',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
