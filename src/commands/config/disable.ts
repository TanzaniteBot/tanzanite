import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import db from '../../constants/db'

export default class DisableCommand extends BotCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'config',
			description: {
				content: 'A command to disable/enable commands.',
				usage: 'disable|enable <command>',
				examples: ['disable ban', 'enable ban'],
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
		const disabledCommands: string[] = await db.globalGet('disabledCommands', []) as string[];
		
		if (disabledCommands.includes(cmd.id)) {
			disabledCommands.splice(disabledCommands.indexOf(cmd.id), 1);
			await db.globalUpdate('disabledCommands', disabledCommands)
			action = 'enabled';
		} else {
			disabledCommands.push(cmd.id);
			await db.globalUpdate('disabledCommands', disabledCommands)
			action = 'disabled';
		}
		return await message.channel.send(`Successfully ${action} command ` + cmd.aliases[0]);
	}
}
