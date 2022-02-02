import {
	BushCommand,
	type ArgType,
	type BushGuild,
	type BushGuildMember,
	type BushMessage,
	type BushSlashMessage,
	type BushUser
} from '#lib';
import { ActivityType, ApplicationCommandOptionType, Embed, PermissionFlagsBits, UserFlags } from 'discord.js';

// TODO: Add bot information
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
		const member = message.guild ? message.guild.members.cache.get(user.id) : undefined;
		await user.fetch(true); // gets banner info and accent color

		const userEmbed = await UserInfoCommand.makeUserInfoEmbed(user, member, message.guild);

		return await message.util.reply({ embeds: [userEmbed] });
	}

	public static async makeUserInfoEmbed(user: BushUser, member?: BushGuildMember, guild?: BushGuild | null) {
		const emojis = [];
		const superUsers = util.getShared('superUsers');

		const userEmbed: Embed = new Embed()
			.setTitle(util.discord.escapeMarkdown(user.tag))
			.setThumbnail(user.displayAvatarURL({ size: 2048, extension: 'png' }))
			.setTimestamp();

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

		const createdAt = util.timestamp(user.createdAt),
			createdAtDelta = util.dateDelta(user.createdAt),
			joinedAt = util.timestamp(member?.joinedAt),
			joinedAtDelta = member && member.joinedAt ? util.dateDelta(member.joinedAt, 2) : undefined,
			premiumSince = util.timestamp(member?.premiumSince),
			premiumSinceDelta = member && member.premiumSince ? util.dateDelta(member.premiumSince, 2) : undefined;

		// General Info
		const generalInfo = [`**Mention:** <@${user.id}>`, `**ID:** ${user.id}`, `**Created:** ${createdAt} (${createdAtDelta} ago)`];
		if (user.accentColor !== null) generalInfo.push(`**Accent Color:** ${user.hexAccentColor}`);
		if (user.banner) generalInfo.push(`**Banner:** [link](${user.bannerURL({ extension: 'png', size: 4096 })})`);
		const pronouns = await Promise.race([util.getPronounsOf(user), util.sleep(2)]);
		if (pronouns && typeof pronouns === 'string') generalInfo.push(`**Pronouns:** ${pronouns}`);

		userEmbed.addField({ name: '» General Info', value: generalInfo.join('\n') });

		// Server User Info
		const serverUserInfo = [];
		if (joinedAt)
			serverUserInfo.push(`**${guild!.ownerId == user.id ? 'Created Server' : 'Joined'}:** ${joinedAt} (${joinedAtDelta} ago)`);
		if (premiumSince) serverUserInfo.push(`**Boosting Since:** ${premiumSince} (${premiumSinceDelta} ago)`);
		if (member?.displayHexColor) serverUserInfo.push(`**Display Color:** ${member.displayHexColor}`);
		if (user.id == '322862723090219008' && guild?.id == client.consts.mappings.guilds.bush)
			serverUserInfo.push(`**General Deletions:** 1⅓`);
		if (
			(['384620942577369088', '496409778822709251'] as const).includes(user.id) &&
			guild?.id == client.consts.mappings.guilds.bush
		)
			serverUserInfo.push(`**General Deletions:** ⅓`);
		if (member?.nickname) serverUserInfo.push(`**Nickname:** ${util.discord.escapeMarkdown(member?.nickname)}`);
		if (serverUserInfo.length)
			userEmbed
				.addField({ name: '» Server Info', value: serverUserInfo.join('\n') })
				.setColor(member?.displayColor ?? util.colors.default);

		// User Presence Info
		if (member?.presence?.status || member?.presence?.clientStatus || member?.presence?.activities) {
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
			if (customStatus && customStatus.length)
				presenceInfo.push(`**Custom Status:** ${util.discord.escapeMarkdown(customStatus)}`);
			userEmbed.addField({ name: '» Presence', value: presenceInfo.join('\n') });

			enum statusEmojis {
				online = '787550449435803658',
				idle = '787550520956551218',
				dnd = '787550487633330176',
				offline = '787550565382750239',
				invisible = '787550565382750239'
			}
			userEmbed.setFooter({
				text: user.tag,
				iconURL: client.emojis.cache.get(statusEmojis[member?.presence.status])?.url ?? undefined
			});
		}

		// roles
		if (member?.roles.cache.size && member?.roles.cache.size - 1) {
			const roles = member?.roles.cache
				.filter((role) => role.name !== '@everyone')
				.sort((role1, role2) => role2.position - role1.position)
				.map((role) => `${role}`);
			userEmbed.addField({ name: `» Role${roles.length - 1 ? 's' : ''} [${roles.length}]`, value: roles.join(', ') });
		}

		// Important Perms
		const perms = [];
		if (member?.permissions.has(PermissionFlagsBits.Administrator) || guild?.ownerId == user.id) {
			perms.push('`Administrator`');
		} else if (member?.permissions.toArray().length) {
			member.permissions.toArray().forEach((permission) => {
				if (client.consts.mappings.permissions[permission]?.important) {
					perms.push(`\`${client.consts.mappings.permissions[permission].name}\``);
				}
			});
		}

		if (perms.length) userEmbed.addField({ name: '» Important Perms', value: perms.join(' ') });
		if (emojis) userEmbed.setDescription(`\u200B${emojis.filter((e) => e).join('  ')}`); // zero width space
		return userEmbed;
	}
}
