/*import { BotCommand } from '../../extensions/BotCommand';
import { Message, MessageEmbed } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class RuleCommand extends BotCommand {
	public constructor() {
		super('capeperms', {
			aliases: ['capeperms', 'capeperm'],
			category: 'mb',
			description: {
				content: 'A command to see what capes someone has access to.',
				usage: 'capeperms <user>',
				examples: ['capeperms IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'string',
					prompt: {
						start: 'Who would you like to see the cape permissions of?',
						retry: '<:no:787549684196704257> Choose someone to see the capes their available capes.',
						optional: false
					},
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { user }: { user: string }): Promise<void> {
		if (message.guild.id !== '516977525906341928') {
			await message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
			return;
		}
	}
}*/
