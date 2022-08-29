import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class DMInhibitor extends BotInhibitor {
	public constructor() {
		super('dm', {
			reason: 'dm',
			type: 'post',
			priority: 75
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.channel === 'dm' && message.guild) {
			void this.client.console.verbose(
				'dm',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
