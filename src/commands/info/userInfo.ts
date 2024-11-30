import {
	Arg,
	BotCommand,
	colors,
	emojis,
	generateBotField,
	generateGeneralInfoField,
	generatePermissionsField,
	generatePresenceField,
	generatePresenceFooter,
	generateRolesField,
	generateServerInfoField,
	mappings,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import {
	ApplicationCommandOptionType,
	EmbedBuilder,
	PermissionFlagsBits,
	UserFlags,
	escapeMarkdown,
	type Guild,
	type GuildMember,
	type User
} from 'discord.js';

export default class UserInfoCommand extends BotCommand {
	public constructor() {
		super('userInfo', {
			aliases: ['user-info', 'user', 'u'],
			category: 'info',
			description: 'Gives information about a specified user.',
			usage: ['user-info [user]'],
			examples: ['user-info 322862723090219008'],
			args: [
				{
					id: 'user',
					description: 'The user you would like to find information about.',
					type: Arg.union('user', 'snowflake'),
					readableType: 'user|snowflake',
					prompt: 'What user would you like to find information about?',
					retry: '{error} Choose a valid user to find information about.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { user: OptArgType<'user' | 'snowflake'> }) {
		const user =
			args.user === null
				? message.author
				: typeof args.user === 'object'
					? args.user
					: await this.client.users.fetch(`${args.user}`).catch(() => undefined);

		if (user === undefined) return message.util.reply(`${emojis.error} Invalid user.`);
		const member = message.guild ? await message.guild.members.fetch(user.id).catch(() => undefined) : undefined;
		await user.fetch(true); // gets banner info and accent color

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, message.guild);

		return await message.util.reply({ embeds: [userEmbed] });
	}

	public static async makeUserInfoEmbed(user: User, member?: GuildMember, guild?: Guild | null) {
		const emojis = [];
		const superUsers = user.client.utils.getShared('superUsers');

		const userEmbed = new EmbedBuilder()
			.setTitle(escapeMarkdown(user.tag))
			.setThumbnail(user.displayAvatarURL({ size: 2048, extension: 'png' }))
			.setTimestamp()
			.setFooter({ text: user.tag })
			.setColor(member?.displayColor ?? colors.default);

		// Flags
		if (user.client.config.owners.includes(user.id)) emojis.push(mappings.otherEmojis.Developer);
		if (superUsers.includes(user.id)) emojis.push(mappings.otherEmojis.Superuser);

		if (user.bot && !user.flags?.has('VerifiedBot')) emojis.push(mappings.otherEmojis.Bot);

		const flags = user.flags?.toArray();
		if (flags) {
			emojis.push(
				...(flags
					.sort((a, b) => mappings.userFlags[a]?.[1] - mappings.userFlags[b]?.[1])
					.map((f) => mappings.userFlags[f]?.[0] ?? `\`${f}\``) satisfies string[])
			);
		}

		// discord omits nitro information to bots, this is just guessing
		if (
			(user.discriminator !== '0' && Number(user.discriminator) < 10) ||
			mappings.commonNitroDiscriminators.includes(user.discriminator) ||
			user.displayAvatarURL()?.endsWith('.gif') || // animated avatars are nitro only
			user.flags?.has(UserFlags.Partner) ||
			user.flags?.has(UserFlags.Staff) ||
			member?.avatar || // per server avatars are nitro only
			user.banner // banners are nitro only
		) {
			emojis.push(mappings.otherEmojis.Nitro);
		}

		if (guild?.ownerId == user.id) emojis.push(mappings.otherEmojis.Owner);
		else if (member?.permissions.has(PermissionFlagsBits.Administrator)) emojis.push(mappings.otherEmojis.Admin);
		if (member?.premiumSinceTimestamp) emojis.push(mappings.otherEmojis.Booster);

		const fields = [
			await generateGeneralInfoField(user),
			generateServerInfoField(member),
			generatePresenceField(member),
			generateRolesField(member),
			generatePermissionsField(member),
			await generateBotField(user)
		].filter((f) => f != null);
		userEmbed.addFields(fields);

		const footer = generatePresenceFooter(member);
		if (footer) userEmbed.setFooter(footer);

		if (emojis) {
			userEmbed.setDescription(
				`\u200B${emojis.filter((e) => e).join('  ')}${
					userEmbed.data.description?.length ? `\n\n${userEmbed.data.description}` : ''
				}`
			); // zero width space
		}

		return userEmbed;
	}
}
