import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class DMInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.Dm, {
			reason: InhibitorReason.Dm,
			type: InhibitorType.Post,
			priority: 75
		});
	}

	public exec(message: CommandMessage | SlashMessage, command: BotCommand): boolean {
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
