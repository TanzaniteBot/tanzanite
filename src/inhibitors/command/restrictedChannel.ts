import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedChannelInhibitor extends BushInhibitor {
	public constructor() {
		super('restrictedChannel', {
			reason: 'restrictedChannel',
			category: 'command',
			type: 'post',
			priority: 10
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				void client.console.verbose(
					'restrictedChannel',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
