import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class DisabledGuildCommandInhibitor extends BotInhibitor {
	public constructor() {
		super('disabledGlobalCommand', {
			reason: 'disabledGlobal',
			type: 'post',
			priority: 300
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (message.author.isOwner()) return false;
		if (this.client.cache.global.disabledCommands.includes(command?.id)) {
			void this.client.console.verbose(
				'disabledGlobalCommand',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
			);
			return true;
		}
		return false;
	}
}
