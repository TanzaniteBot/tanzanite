import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message } from 'discord.js';

export default class PrefixCommand extends BotCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			args: [
				{
					id: 'prefix',
					default: '-'
				}
			],
			channel: 'guild'
		});
	}

	public async exec(message: { guild: { id: unknown; }; reply: (arg0: string) => unknown; }, args: { prefix: unknown; }): Promise<void> {
		const oldPrefix = this.client.settings.get(message.guild.id, 'prefix', '-');
 
		await this.client.settings.set(message.guild.id, 'prefix', args.prefix);
		message.reply(`Prefix changed from \`${oldPrefix}\` to \`${args.prefix}\``);
	}
}