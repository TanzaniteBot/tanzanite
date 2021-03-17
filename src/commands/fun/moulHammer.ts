import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message, MessageEmbed, User } from 'discord.js';

export default class MoulHammerCommand extends BotCommand {
	public constructor() {
		super('moulhammer', {
			aliases: ['moulhammer'],
			category: 'fun',
			description: {
				content: 'A command to moul hammer members.',
				usage: 'moulHammer <user>',
				examples: ['moulHammer @IRONM00N']
			},
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to moul hammer?',
						retry: '<:no:787549684196704257> Choose a valid user to moul hammer'
					}
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		await message.delete();
		const moulHammerEmbed = new MessageEmbed().setTitle('L').setDescription(`${user.username} got moul'ed ${this.client.consts.wideberry1}${this.client.consts.wideberry2}`).setColor(this.client.consts.Blurple);
		await message.util.send(moulHammerEmbed);
	}
}
