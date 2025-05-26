import {
	AllIntegrationTypes,
	AllInteractionContexts,
	Arg,
	BotCommand,
	colors,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, EmbedBuilder, GuildMember } from 'discord.js';

export default class AvatarCommand extends BotCommand {
	public constructor() {
		super('avatar', {
			aliases: ['avatar', 'av'],
			category: 'info',
			description: "A command to get a user's avatar.",
			usage: ['avatar [user]'],
			examples: ['avatar', 'av IRONM00N'],
			args: [
				{
					id: 'user',
					description: 'The user you would like to find the avatar of.',
					type: Arg.union('member', 'globalUser'),
					readableType: 'member|user',
					prompt: 'Who would you like to see the avatar of?',
					retry: '{error} Choose a valid user.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slash: true,
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { user: OptArgType<'member' | 'globalUser'> }) {
		const params: { size: 2048; extension: 'png'; dynamic: true } = { size: 2048, extension: 'png', dynamic: true };
		const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${Math.ceil(Math.random() * 6) - 1}.png`;

		const member =
			(args.user ?? message.member) instanceof GuildMember ? (args.user ?? (message.member as GuildMember | null)) : null;
		const user = args.user instanceof GuildMember ? args.user.user : (args.user ?? message.author);

		const guildAvatar = member?.avatarURL(params);

		const embed = new EmbedBuilder().setTimestamp().setColor(colors.default).setTitle(`${user.tag}'s Avatar`);
		guildAvatar
			? embed.setImage(guildAvatar).setThumbnail(user.avatarURL(params) ?? defaultAvatar)
			: embed.setImage(user.avatarURL(params) ?? defaultAvatar);

		await message.util.reply({ embeds: [embed] });
	}
}
