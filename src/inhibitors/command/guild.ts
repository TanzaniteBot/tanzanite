import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class GuildInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.Guild, {
			reason: InhibitorReason.Guild,
			type: InhibitorType.Post,
			priority: 80
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (command.channel === 'guild' && !message.inGuild()) {
			void this.client.console.verbose(
				InhibitorReason.Guild,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.author.tag}>>.`
			);
			return true;
		}
		return false;
	}
}
