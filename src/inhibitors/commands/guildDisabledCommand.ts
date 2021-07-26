import { BushCommand, BushInhibitor, BushMessage, BushSlashMessage } from '@lib';

export default class DisabledGuildCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledGuildCommand', {
			reason: 'disabledGuild',
			type: 'pre',
			priority: 3
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (!message.guild || !message.guild) return;
		if (message.author.isOwner() || message.author.isSuperUser()) return false; // super users bypass guild disabled commands

		if ((await message.guild.getSetting('disabledCommands'))?.includes(command?.id)) {
			client.console.debug(`disabledGuildCommand blocked message.`);
			return true;
		}
	}
}
