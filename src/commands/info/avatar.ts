import { Constants } from 'discord-akairo';
import { MessageEmbed, User } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class AvatarCommand extends BushCommand {
	constructor() {
		super('avatar', {
			aliases: ['avatar', 'av'],
			category: 'info',
			description: {
				content: "A command to get a user's avatar",
				usage: 'avatar [user]',
				examples: 'avatar'
			},
			args: [
				{
					id: 'user',
					type: Constants.ArgumentTypes.USER,
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'Who would you like to see the avatar of?',
						retry: '{error} Choose a valid user.',
						optional: true
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'The user you would like to find the avatar of.',
					type: 'USER',
					required: false
				}
			]
		});
	}

	async exec(message: BushMessage | BushSlashMessage, { user }: { user: User }): Promise<void> {
		user = user ?? message.author;

		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(this.client.util.colors.default)
			.setTitle(user.tag)
			.setImage(user.avatarURL({ size: 2048, format: 'png', dynamic: true }));

		await message.util.reply({ embeds: [embed] });
	}
}
