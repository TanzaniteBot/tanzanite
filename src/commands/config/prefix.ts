import { BotCommand } from '../../extensions/BotCommand';
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
					match: 'content',
					default: '-',
				}
			],
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD'
		});
	}

	public async exec(message: Message, args: { prefix: string; }): Promise<void> {
		const oldPrefix = await this.client.guildSettings.get(message.guild.id, 'prefix', '-');
 
		await this.client.guildSettings.set(message.guild.id, 'prefix', args.prefix);
		message.channel.send(`Prefix changed from \`${oldPrefix}\` to \`${args.prefix}\``);
	}
}