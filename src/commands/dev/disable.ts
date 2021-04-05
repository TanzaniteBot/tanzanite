import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import db from '../../constants/db';

export default class DisableCommand extends BushCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'dev',
			description: {
				content: 'A command to disable/enable commands.',
				usage: 'disable|enable <command>',
				examples: ['disable ban', 'enable ban']
			},
			args: [
				{
					id: 'cmd',
					type: 'commandAlias',
					match: 'content',
					prompt: {
						start: 'What would you like to disable?',
						retry: '<:no:787549684196704257> Choose a valid command.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(
		message: Message,
		{ cmd }: { cmd: Command }
	): Promise<void> {
		if (!this.client.config.owners.includes(message.author.id)) {
			await message.channel.send(
				'<:no:787549684196704257> Only my owners can use this command.'
			);
			return;
		}
		if (cmd.id == 'disable' || cmd.id == 'eval') {
			await message.util.reply(`You cannot disable \`${cmd.aliases[0]}\`.`);
			return;
		}
		let action: string;
		const disabledCommands: string[] = (await db.globalGet(
			'disabledCommands',
			[]
		)) as string[];

		if (disabledCommands.includes(cmd.id)) {
			disabledCommands.splice(disabledCommands.indexOf(cmd.id), 1);
			await db.globalUpdate('disabledCommands', disabledCommands);
			action = 'enabled';
		} else {
			disabledCommands.push(cmd.id);
			await db.globalUpdate('disabledCommands', disabledCommands);
			action = 'disabled';
		}
		await message.util.reply(
			`Successfully ${action} command ` + cmd.aliases[0]
		);
		return;
	}
}
