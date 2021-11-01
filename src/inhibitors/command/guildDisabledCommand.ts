import { BushInhibitor, type BushCommand, type BushMessage, type BushSlashMessage } from '@lib';

export default class DisabledGuildCommandInhibitor extends BushInhibitor {
	public constructor() {
		super('disabledGuildCommand', {
			reason: 'disabledGuild',
			category: 'command',
			type: 'post',
			priority: 250
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, command: BushCommand): Promise<boolean> {
		if (!message.guild || !message.guild) return false;
		if (message.author.isOwner() || message.author.isSuperUser()) return false; // super users bypass guild disabled commands

		if ((await message.guild.getSetting('disabledCommands'))?.includes(command?.id)) {
			return true;
		}
		return false;
	}
}
