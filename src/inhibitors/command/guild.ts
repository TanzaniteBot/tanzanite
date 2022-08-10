import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class GuildInhibitor extends BushInhibitor {
	public constructor() {
		super('guild', {
			reason: 'guild',
			category: 'command',
			type: 'post',
			priority: 80
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (command.channel === 'guild' && !message.guild) {
			void this.client.console.verbose(
				'guild',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.author.tag}>>.`
			);
			return true;
		}
		return false;
	}
}
