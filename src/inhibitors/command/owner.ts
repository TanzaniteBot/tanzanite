import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class OwnerInhibitor extends BushInhibitor {
	public constructor() {
		super('owner', {
			reason: 'owner',
			category: 'command',
			type: 'post',
			priority: 100
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
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
