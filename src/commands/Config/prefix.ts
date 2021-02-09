import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message } from 'discord.js';

export default class PrefixCommand extends BotCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			description: {
				content: 'A command to change the bot\'s prefix.',
				usage: 'prefix [prefix]',
				examples: ['prefix ?'],
			},
			args: [
				{
					id: 'prefix',
					default: '-'
				}
			],
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD'
		});
	}

	public async exec(message: Message, args: { prefix: unknown; }): Promise<void> {
		const oldPrefix = this.client.settings.get(message.guild.id, 'prefix', '-');
 
		await this.client.settings.set(message.guild.id, 'prefix', args.prefix);
		message.reply(`Prefix changed from \`${oldPrefix}\` to \`${args.prefix}\``);
	}
}