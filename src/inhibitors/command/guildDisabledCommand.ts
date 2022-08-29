import { BotInhibitor, type BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class DisabledGuildCommandInhibitor extends BotInhibitor {
	public constructor() {
		super('disabledGuildCommand', {
			reason: 'disabledGuild',
			type: 'post',
			priority: 250
		});
	}

	public async exec(message: CommandMessage | SlashMessage, command: BotCommand): Promise<boolean> {
		if (!message.guild || !message.guild) return false;
		if (message.author.isOwner() || message.author.isSuperUser()) return false; // super users bypass guild disabled commands

		if ((await message.guild.getSetting('disabledCommands'))?.includes(command?.id)) {
			void this.client.console.verbose(
				'disabledGuildCommand',
				`Blocked message with id <<${message.id}>> from <<${message.author.tag}>> in <<${message.guild.name}>>.`
			);
			return true;
		}
		return false;
	}
}
