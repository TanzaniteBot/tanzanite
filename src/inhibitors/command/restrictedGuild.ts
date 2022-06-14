import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class RestrictedGuildInhibitor extends BushInhibitor {
	public constructor() {
		super('restrictedGuild', {
			reason: 'restrictedGuild',
			category: 'command',
			type: 'post',
			priority: 5
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (command.restrictedChannels?.length && message.channel) {
			if (!command.restrictedChannels.includes(message.channel.id)) {
				void client.console.verbose(
					'restrictedGuild',
					`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
				);
				return true;
			}
		}
		return false;
	}
}
