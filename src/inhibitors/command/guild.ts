import { BotInhibitor, InhibitorReason, InhibitorType, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class GuildInhibitor extends BotInhibitor {
	public constructor() {
		super(InhibitorReason.Guild, {
			reason: InhibitorReason.Guild,
			type: InhibitorType.Post,
			priority: 80
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (command.channel === 'guild' && !message.guild) {
			void this.client.console.verbose(
				InhibitorReason.Guild,
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.author.tag}>>.`
			);
			return true;
		}
		return false;
	}
}
