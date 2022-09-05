import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class SuperUserInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.SuperUser, {
			reason: InhibitorReason.SuperUser,
			type: InhibitorType.Post,
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
