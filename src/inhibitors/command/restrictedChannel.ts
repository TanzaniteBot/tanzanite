import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedChannelInhibitor extends BotInhibitor {
	public constructor() {
		super('restrictedChannel', {
			reason: 'restrictedChannel',
			type: 'post',
			priority: 10
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				void this.client.console.verbose(
					'restrictedChannel',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
