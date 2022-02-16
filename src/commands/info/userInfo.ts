import {
	BushCommand,
	type ArgType,
	type BushGuild,
	type BushGuildMember,
	type BushMessage,
	type BushSlashMessage,
	type BushUser
} from '#lib';
import { TeamMemberMembershipState, type APIApplication } from 'discord-api-types/v9';
import {
	ActivityType,
	ApplicationCommandOptionType,
	ApplicationFlagsBitField,
	Embed,
	PermissionFlagsBits,
	UserFlags
} from 'discord.js';

export default class UserInfoCommand extends BushCommand {
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
					type: util.arg.union('user', 'snowflake'),
					readableType: 'user|snowflake',
					prompt: 'What user would you like to find information about?',
					retry: '{error} Choose a valid user to find information about.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { user: ArgType<'user'> | ArgType<'snowflake'> }) {
		const user =
			args?.user === undefined || args?.user === null
				? message.author
				: typeof args.user === 'object'
				? args.user
				: await client.users.fetch(`${args.user}`).catch(() => undefined);
		if (user === undefined) return message.util.reply(`${util.emojis.error} Invalid user.`);
		const member = message.guild ? await message.guild.members.fetch(user.id).catch(() => undefined) : undefined;
		await user.fetch(true); // gets banner info and accent color

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, message.guild);

		return await message.util.reply({ embeds: [userEmbed] });
	}

	public static async makeUserInfoEmbed(user: BushUser, member?: BushGuildMember, guild?: BushGuild | null) {
		const emojis = [];
		const superUsers = util.getShared('superUsers');

		const userEmbed = new Embed()
			.setTitle(util.discord.escapeMarkdown(user.tag))
			.setThumbnail(user.displayAvatarURL({ size: 2048, extension: 'png' }))
			.setTimestamp()
			.setFooter({ text: user.tag })
			.setColor(member?.displayColor ?? util.colors.default);

		// Flags
		if (client.config.owners.includes(user.id)) emojis.push(client.consts.mappings.otherEmojis.Developer);
		if (superUsers.includes(user.id)) emojis.push(client.consts.mappings.otherEmojis.Superuser);
		const flags = user.flags?.toArray();
		if (flags) {
			flags.forEach((f) => {
				if (client.consts.mappings.userFlags[f] !== undefined) {
					emojis.push(client.consts.mappings.userFlags[f]);
				} else emojis.push(`\`${f}\``);
			});
		}

		// Since discord bald I just guess if someone has nitro
		if (
			Number(user.discriminator) < 10 ||
			client.consts.mappings.maybeNitroDiscrims.includes(user.discriminator) ||
			user.displayAvatarURL()?.endsWith('.gif') ||
			user.flags?.has(UserFlags.Partner) ||
			user.flags?.has(UserFlags.Staff) ||
			member?.avatar // server avatar
		) {
			emojis.push(client.consts.mappings.otherEmojis.Nitro);
		}

		if (guild?.ownerId == user.id) emojis.push(client.consts.mappings.otherEmojis.Owner);
		else if (member?.permissions.has(PermissionFlagsBits.Administrator)) emojis.push(client.consts.mappings.otherEmojis.Admin);
		if (member?.premiumSinceTimestamp) emojis.push(client.consts.mappings.otherEmojis.Booster);

		await this.generateGeneralInfoField(userEmbed, user);

		this.generateServerInfoField(userEmbed, member);

		this.generatePresenceField(userEmbed, member);

		this.generateRolesField(userEmbed, member);

		this.generatePermissionsField(userEmbed, member);

		await this.generateBotField(userEmbed, user);

		if (emojis)
			userEmbed.setDescription(
				`\u200B${emojis.filter((e) => e).join('  ')}${userEmbed.description?.length ? `\n\n${userEmbed.description}` : ''}`
			); // zero width space
		return userEmbed;
	}

	private static async generateGeneralInfoField(embed: Embed, user: BushUser) {
		// General Info
		const generalInfo = [
			`**Mention:** <@${user.id}>`,
			`**ID:** ${user.id}`,
			`**Created:** ${util.timestampAndDelta(user.createdAt)}`
		];
		if (user.accentColor !== null) generalInfo.push(`**Accent Color:** ${user.hexAccentColor}`);
		if (user.banner) generalInfo.push(`**Banner:** [link](${user.bannerURL({ extension: 'png', size: 4096 })})`);

		const pronouns = await Promise.race([util.getPronounsOf(user), util.sleep(2)]); // cut off request after 2 seconds

		if (pronouns && typeof pronouns === 'string' && pronouns !== 'Unspecified') generalInfo.push(`**Pronouns:** ${pronouns}`);

		embed.addField({ name: '» General Info', value: generalInfo.join('\n') });
	}

	private static generateServerInfoField(embed: Embed, member?: BushGuildMember | undefined) {
		if (!member) return;

		// Server User Info
		const serverUserInfo = [];
		if (member.joinedTimestamp)
			serverUserInfo.push(
				`**${member.guild!.ownerId == member.user.id ? 'Created Server' : 'Joined'}:** ${util.timestampAndDelta(
					member.joinedAt!
				)}`
			);
		if (member.premiumSince) serverUserInfo.push(`**Boosting Since:** ${util.timestampAndDelta(member.premiumSince)}`);
		if (member.displayHexColor) serverUserInfo.push(`**Display Color:** ${member.displayHexColor}`);
		if (member.user.id == '322862723090219008' && member.guild?.id == client.consts.mappings.guilds.bush)
			serverUserInfo.push(`**General Deletions:** 1⅓`);
		if (
			(['384620942577369088', '496409778822709251'] as const).includes(member.user.id) &&
			member.guild.id == client.consts.mappings.guilds.bush
		)
			serverUserInfo.push(`**General Deletions:** ⅓`);
		if (member?.nickname) serverUserInfo.push(`**Nickname:** ${util.discord.escapeMarkdown(member?.nickname)}`);
		if (serverUserInfo.length) embed.addField({ name: '» Server Info', value: serverUserInfo.join('\n') });
	}

	private static generatePresenceField(embed: Embed, member?: BushGuildMember | undefined) {
		if (!member || !member.presence) return;
		if (!member.presence.status && !member.presence.clientStatus && !member.presence.activities) return;

		// User Presence Info
		let customStatus = '';
		const activitiesNames: string[] = [];
		if (member.presence.activities) {
			member.presence.activities.forEach((a) => {
				if (a.type == ActivityType.Custom && a.state) {
					const emoji = `${a.emoji ? `${a.emoji.toString()} ` : ''}`;
					customStatus = `${emoji}${a.state}`;
				}
				activitiesNames.push(`\`${a.name}\``);
			});
		}
		let devices;
		if (member?.presence.clientStatus) devices = Object.keys(member.presence.clientStatus);
		const presenceInfo = [];
		if (member?.presence.status) presenceInfo.push(`**Status:** ${member.presence.status}`);
		if (devices && devices.length)
			presenceInfo.push(`**${devices.length - 1 ? 'Devices' : 'Device'}:** ${util.oxford(devices, 'and', '')}`);
		if (activitiesNames.length)
			presenceInfo.push(`**Activit${activitiesNames.length - 1 ? 'ies' : 'y'}:** ${util.oxford(activitiesNames, 'and', '')}`);
		if (customStatus && customStatus.length) presenceInfo.push(`**Custom Status:** ${util.discord.escapeMarkdown(customStatus)}`);
		embed.addField({ name: '» Presence', value: presenceInfo.join('\n') });

		enum statusEmojis {
			online = '787550449435803658',
			idle = '787550520956551218',
			dnd = '787550487633330176',
			offline = '787550565382750239',
			invisible = '787550565382750239'
		}
		embed.setFooter({
			text: member.user.tag,
			iconURL: client.emojis.cache.get(statusEmojis[member?.presence.status])?.url ?? undefined
		});
	}

	private static generateRolesField(embed: Embed, member?: BushGuildMember | undefined) {
		if (!member || member.roles.cache.size < 1) return;

		// roles
		const roles = member.roles.cache
			.filter((role) => role.name !== '@everyone')
			.sort((role1, role2) => role2.position - role1.position)
			.map((role) => `${role}`);
		embed.addField({ name: `» Role${roles.length - 1 ? 's' : ''} [${roles.length}]`, value: roles.join(', ') });
	}

	private static generatePermissionsField(embed: Embed, member: BushGuildMember | undefined) {
		if (!member) return;

		// Important Perms
		const perms = [];
		if (member?.permissions.has(PermissionFlagsBits.Administrator) || member.guild?.ownerId == member.user.id) {
			perms.push('`Administrator`');
		} else if (member?.permissions.toArray().length) {
			member.permissions.toArray().forEach((permission) => {
				if (client.consts.mappings.permissions[permission]?.important) {
					perms.push(`\`${client.consts.mappings.permissions[permission].name}\``);
				}
			});
		}

		if (perms.length) embed.addField({ name: '» Important Perms', value: perms.join(' ') });
	}

	private static async generateBotField(embed: Embed, user: BushUser) {
		if (!user.bot) return;

		const applicationInfo = (await client.rest.get(`/applications/${user.id}/rpc`).catch(() => null)) as APIApplication | null;
		if (!applicationInfo) return;

		const flags = new ApplicationFlagsBitField(applicationInfo.flags);

		const botInfo = [
			`**Publicity:** ${applicationInfo.bot_public ? 'Public' : 'Private'}`,
			`**Requires Code Grant:** ${applicationInfo.bot_require_code_grant ? util.emojis.check : util.emojis.cross}`,
			`**Server Members Intent:** ${
				flags.has('GatewayGuildMembers')
					? util.emojis.check
					: flags.has('GatewayGuildMembersLimited')
					? util.emojis.warn
					: util.emojis.cross
			}`,
			`**Presence Intent:** ${
				flags.has('GatewayPresence')
					? util.emojis.check
					: flags.has('GatewayPresenceLimited')
					? util.emojis.warn
					: util.emojis.cross
			}`,
			`**Message Content Intent:** ${
				flags.has('GatewayMessageContent')
					? util.emojis.check
					: flags.has('GatewayMessageContentLimited')
					? util.emojis.warn
					: util.emojis.cross
			}`
		];

		if (applicationInfo.owner || applicationInfo.team) {
			const teamMembers = applicationInfo.owner
				? [applicationInfo.owner]
				: applicationInfo
						.team!.members.filter((tm) => tm.membership_state === TeamMemberMembershipState.Accepted)
						.map((tm) => tm.user);
			botInfo.push(
				`**Developer${teamMembers.length > 1 ? 's' : ''}:** ${teamMembers
					.map((m) => `${m.username}#${m.discriminator}`)
					.join(', ')}`
			);
		}

		if (botInfo.length) embed.addField({ name: '» Bot Info', value: botInfo.join('\n') });
	}
}
