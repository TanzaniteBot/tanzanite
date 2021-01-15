import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import { User } from 'discord.js';
import { MessageEmbed } from 'discord.js';

export default class MoulHammerCommand extends BotCommand {
	public constructor() {
		super('moulHammer', {
			aliases: ['moulHammer'],
			category: 'fun',
			description: {
				content: 'A command to Moul hammer members.',
				usage: 'moulHammer <user>',
				examples: ['moulHammer @user'],
			},
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to Moul hammer?',
					},
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<void> {
		message.delete();
		const moulHammerEmbed = new MessageEmbed()
			.setTitle('L')
			.setDescription(`${user.username} got moul'ed <:wideberry1:756223352598691942><:wideberry2:756223336832303154>.'`)
			.setColor('#a839ce');
		message.util.send(moulHammerEmbed);
	}
}
