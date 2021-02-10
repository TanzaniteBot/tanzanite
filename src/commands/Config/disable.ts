import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class DisableCommand extends BotCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'config',
			description: {
				content: 'A command to disable/enable commands.',
				usage: 'disable|enable <command>',
				examples: ['disable role', 'enable role'],
			},
			args: [
				{
					id: 'cmd',
					type: 'commandAlias',
					match: 'content',
					prompt: {
						start: 'What would you like to disable?',
					},
				},
			],
			permissionLevel: PermissionLevel.Superuser,
		});
	}
	public async exec(message: Message, { cmd }: { cmd: Command }): Promise<Message> {
		if (cmd.id == 'disable') return await message.util.reply(`You cannot disable ${cmd.aliases[0]}.`)
		let action: string;
		let disabledCommands = await this.client.globalSettings.get(this.client.user.id, 'disabledCommands', undefined)
		if (disabledCommands === undefined){
			disabledCommands = []
		}
		if (disabledCommands.includes(cmd.id)) {
			const a = disabledCommands.splice(disabledCommands.indexOf(cmd.id), 1);
			this.client.globalSettings.set(this.client.user.id, 'disabledCommands', a)
			action = 'enabled';
		} else {
			const a = disabledCommands.push(cmd.id);
			this.client.globalSettings.set(this.client.user.id, 'disabledCommands', a)
			action = 'disabled';
		}
		return await message.util.reply(`Successfully ${action} command ` + cmd.aliases[0]);
	}
}
