import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class SuperUserInhibitor extends BotInhibitor {
	public constructor() {
		super('superUser', {
			reason: 'superUser',
			type: 'post',
			priority: 99
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.superUserOnly) {
			if (!this.client.isSuperUser(message.author)) {
				void this.client.console.verbose(
					'superUser',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
