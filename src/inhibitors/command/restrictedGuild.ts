import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedGuildInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.RestrictedGuild, {
			reason: InhibitorReason.RestrictedGuild,
			type: InhibitorType.Post,
			priority: 5
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (command.restrictedGuilds?.length ?? 0) {
			if (!message.inGuild()) return true;
			if (!command.restrictedGuilds!.includes(message.guildId)) {
				void this.client.console.verbose(
					InhibitorReason.RestrictedGuild,
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
