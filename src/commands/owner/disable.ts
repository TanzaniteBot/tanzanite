import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';

export default class DisableCommand extends BotCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'owner',
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
			ownerOnly: true,
		});
	}
	public async exec(message: Message, { cmd }: { cmd: Command }): Promise<void> {
		let action: string;
		if (this.client.disabledCommands.includes(cmd.id)) {
			this.client.disabledCommands.splice(this.client.disabledCommands.indexOf(cmd.id), 1);
			action = 'enabled';
		} else {
			this.client.disabledCommands.push(cmd.id);
			action = 'disabled';
		}
		await message.util.reply(`Successfully ${action} command ` + cmd.aliases[0]);
	}
}
