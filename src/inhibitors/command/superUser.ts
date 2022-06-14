import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class SuperUserInhibitor extends BushInhibitor {
	public constructor() {
		super('superUser', {
			reason: 'superUser',
			category: 'command',
			type: 'post',
			priority: 99
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (command.superUserOnly) {
			if (!client.isSuperUser(message.author)) {
				void client.console.verbose(
					'superUser',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
