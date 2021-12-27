import { ArgType, BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { GuildMember, MessageEmbed } from 'discord.js';

export default class AvatarCommand extends BushCommand {
	constructor() {
		super('avatar', {
			aliases: ['avatar', 'av'],
			category: 'info',
			description: "A command to get a user's avatar",
			usage: ['avatar [user]'],
			examples: ['avatar', 'av IRONM00N'],
			args: [
				{
					id: 'user',
					description: 'The user you would like to find the avatar of.',
					type: util.arg.union('member', 'globalUser'),
					readableType: 'member|user',
					prompt: 'Who would you like to see the avatar of?',
					retry: '{error} Choose a valid user.',
					optional: true,
					slashType: 'USER'
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			slash: true
		});
	}

	override async exec(message: BushMessage | BushSlashMessage, args: { user: ArgType<'member'> | ArgType<'globalUser'> }) {
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
