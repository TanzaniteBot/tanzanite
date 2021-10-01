import { GuildMember, MessageEmbed, User } from 'discord.js';
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
					customType: util.arg.union('member', 'globalUser'),
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

	override async exec(message: BushMessage | BushSlashMessage, args: { user: GuildMember | User }): Promise<void> {
		const params: { size: 2048; format: 'png'; dynamic: true } = { size: 2048, format: 'png', dynamic: true };
		const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${Math.ceil(Math.random() * 6) - 1}.png`;

		const member = (args.user ?? message.member) instanceof GuildMember ? args.user ?? message.member : undefined;
		const user = args.user instanceof GuildMember ? args.user.user : args.user ?? message.author;

		const guildAvatar = member?.avatarURL(params);

		const embed = new MessageEmbed().setTimestamp().setColor(util.colors.default).setTitle(`${user.tag}'s Avatar`);
		guildAvatar
			? embed.setImage(guildAvatar).setThumbnail(user.avatarURL(params) ?? defaultAvatar)
			: embed.setImage(user.avatarURL(params) ?? defaultAvatar);

		await message.util.reply({ embeds: [embed] });
	}
}
