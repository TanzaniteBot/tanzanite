import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedChannelInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.RestrictedChannel, {
			reason: InhibitorReason.RestrictedChannel,
			type: InhibitorType.Post,
			priority: 10
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
		if (command.restrictedChannels?.length ?? 0) {
			if (!message.channel) return true;
			if (!command.restrictedChannels!.includes(message.channel.id)) {
				void this.client.console.verbose(
					InhibitorReason.RestrictedChannel,
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
