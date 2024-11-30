import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class OwnerInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.Owner, {
			reason: InhibitorReason.Owner,
			type: InhibitorType.Post,
			priority: 100
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (command.ownerOnly) {
			if (!this.client.isOwner(message.author)) {
				void this.client.console.verbose(
					InhibitorReason.Owner,
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
