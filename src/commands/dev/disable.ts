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
						retry: '<:error:837123021016924261> Choose a valid command.'
					}
				}
			],
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message, { cmd }: { cmd: Command }): Promise<unknown> {
		if (!this.client.config.owners.includes(message.author.id)) return message.channel.send('<:error:837123021016924261> Only my owners can use this command.');
		if (cmd.id == 'disable' || cmd.id == 'eval') return message.util.reply(`<:error:837123021016924261> You cannot disable the \`${cmd.aliases[0]}\` command.`);

		let action: string;
		const disabledCommands: string[] = (await db.globalGet('disabledCommands', [])) as string[];

		if (disabledCommands.includes(cmd.id)) {
			disabledCommands.splice(disabledCommands.indexOf(cmd.id), 1);
			await db.globalUpdate('disabledCommands', disabledCommands);
			action = 'enabled';
		} else {
			disabledCommands.push(cmd.id);
			await db.globalUpdate('disabledCommands', disabledCommands);
			action = 'disabled';
		}
		return message.util.reply(`<:checkmark:837109864101707807> Successfully \`${action}\` the \`${cmd.aliases[0]}\` command`);
	}
}
