import { BushInhibitor, type BushCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class DisabledGuildCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledGlobalCommand', {
			reason: 'disabledGlobal',
			category: 'command',
			type: 'post',
			priority: 300
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BushCommand): Promise<boolean> {
		if (message.author.isOwner()) return false;
		if (client.cache.global.disabledCommands.includes(command?.id)) {
			void client.console.verbose(
				'disabledGlobalCommand',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild?.name}>>.`
			);
			return true;
		}
		return false;
	}
}
