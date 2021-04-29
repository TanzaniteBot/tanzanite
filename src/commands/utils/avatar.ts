import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, User, MessageEmbed } from 'discord.js';

export default class AvatarCommand extends BushCommand {
	constructor() {
		super('avatar', {
			aliases: ['avatar', 'av'],
			category: 'utils',
			description: {
				content: "A command to get a user's avatar",
				usage: 'avatar [user]',
				examples: 'avatar'
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'Who would you like to see the avatar of?',
						retry: '<:error:837123021016924261> Choose a valid user.',
						optional: true
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS']
		});
	}

	async exec(message: Message, { user }: { user: User }): Promise<void> {
		let user1: User;
		if (user) {
			user1 = user;
		} else {
			user1 = message.author;
		}
		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(this.client.consts.DefaultColor)
			.setTitle(user1.tag)
			.setImage(user1.avatarURL({ size: 2048, format: 'png', dynamic: true }));

		await message.util.reply(embed);
	}
}
