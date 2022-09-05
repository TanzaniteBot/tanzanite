import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedChannelInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.RestrictedChannel, {
			reason: InhibitorReason.RestrictedChannel,
			type: InhibitorType.Post,
			priority: 10
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
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
