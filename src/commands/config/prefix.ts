import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import db from '../../constants/db'


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

	public async exec(message: Message, { prefix }: { prefix: string; }): Promise<void> {
		const oldPrefix = await db.guildGet('prefix', message.guild.id, null)
		await db.guildUpdate('prefix', prefix, message.guild.id)
		message.channel.send(`Prefix changed from \`${oldPrefix}\` to \`${prefix}\``);
	}
}