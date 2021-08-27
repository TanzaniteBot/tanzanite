import { CommandInteraction, MessageEmbed, User } from 'discord.js';
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
					type: 'user',
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

	override async exec(message: BushMessage | BushSlashMessage, args: { user: User }): Promise<void> {
		client.console.debugRaw(args);
		client.console.debugRaw(message.interaction);
		client.console.debugRaw((message.interaction as CommandInteraction).options.getUser('user'));
		const user = args.user ?? message.author;

		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(util.colors.default)
			.setTitle(`${user.tag}'s Avatar`)
			.setImage(
				user.avatarURL({ size: 2048, format: 'png', dynamic: true }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png'
			);
		await message.util.reply({ embeds: [embed] });
	}
}
