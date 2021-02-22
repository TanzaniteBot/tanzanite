import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { botOptionsSchema } from '../../extensions/mongoose';

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
		const botOptions = await botOptionsSchema.findOne({environment: this.client.config.environment})
		const disabledCommands: string[] = botOptions['disabledCommands']
		if (disabledCommands.includes(cmd.id)) {
			disabledCommands.splice(disabledCommands.indexOf(cmd.id), 1);
			const Query = await botOptionsSchema.findByIdAndUpdate(botOptions['_id'], {disabledCommands: disabledCommands})
			Query.save()
			action = 'enabled';
		} else {
			disabledCommands.push(cmd.id);
			const Query = await botOptionsSchema.findByIdAndUpdate(botOptions['_id'], {disabledCommands: disabledCommands})
			Query.save()
			action = 'disabled';
		}
		return await message.channel.send(`Successfully ${action} command ` + cmd.aliases[0]);
	}
}
