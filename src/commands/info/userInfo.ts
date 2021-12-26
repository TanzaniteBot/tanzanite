import {
	BushCommand,
	BushGuild,
	BushGuildMember,
	type BushMessage,
	type BushSlashMessage,
	type BushUser
} from '#lib';
import { MessageEmbed, type Snowflake } from 'discord.js';

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
					slashType: 'USER'
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { user: BushUser | Snowflake }) {
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
		const superUsers = client.cache.global.superUsers;

		const userEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(util.discord.escapeMarkdown(user.tag))
			.setThumbnail(user.displayAvatarURL({ size: 2048, format: 'png', dynamic: true }))
			.setTimestamp();

		// Flags
		if (client.config.owners.includes(user.id)) emojis.push(client.consts.mappings.otherEmojis.DEVELOPER);
		if (superUsers.includes(user.id)) emojis.push(client.consts.mappings.otherEmojis.SUPERUSER);
		const flags = user.flags?.toArray();
		if (flags) {
			flags.forEach((f) => {
				if (client.consts.mappings.userFlags[f]) {
					emojis.push(client.consts.mappings.userFlags[f]);
				} else emojis.push(`\`${f}\``);
			});
		}

		// Since discord bald I just guess if someone has nitro
		if (
			Number(user.discriminator) < 10 ||
			client.consts.mappings.maybeNitroDiscrims.includes(user.discriminator) ||
			user.displayAvatarURL({ dynamic: true })?.endsWith('.gif') ||
			user.flags?.toArray().includes('PARTNERED_SERVER_OWNER')
		) {
			emojis.push(client.consts.mappings.otherEmojis.NITRO);
		}

		if (guild?.ownerId == user.id) emojis.push(client.consts.mappings.otherEmojis.OWNER);
		else if (member?.permissions.has('ADMINISTRATOR')) emojis.push(client.consts.mappings.otherEmojis.ADMIN);
		if (member?.premiumSinceTimestamp) emojis.push(client.consts.mappings.otherEmojis.BOOSTER);

		const createdAt = util.timestamp(user.createdAt),
			createdAtDelta = util.dateDelta(user.createdAt),
			joinedAt = util.timestamp(member?.joinedAt),
			joinedAtDelta = member && member.joinedAt ? util.dateDelta(member.joinedAt, 2) : undefined,
			premiumSince = util.timestamp(member?.premiumSince),
			premiumSinceDelta = member && member.premiumSince ? util.dateDelta(member.premiumSince, 2) : undefined;

		// General Info
		const generalInfo = [`**Mention:** <@${user.id}>`, `**ID:** ${user.id}`, `**Created:** ${createdAt} (${createdAtDelta} ago)`];
		if (user.accentColor !== null) generalInfo.push(`**Accent Color:** ${user.hexAccentColor}`);
		if (user.banner) generalInfo.push(`**Banner:** [link](${user.bannerURL({ dynamic: true, format: 'png', size: 4096 })})`);
		const pronouns = await Promise.race([util.getPronounsOf(user), util.sleep(2)]);
		if (pronouns && typeof pronouns === 'string') generalInfo.push(`**Pronouns:** ${pronouns}`);

		userEmbed.addField('» General Info', generalInfo.join('\n'));

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
			userEmbed.addField('» Server Info', serverUserInfo.join('\n')).setColor(member?.displayColor ?? util.colors.default);

		// User Presence Info
		if (member?.presence?.status || member?.presence?.clientStatus || member?.presence?.activities) {
			let customStatus = '';
			const activitiesNames: string[] = [];
			if (member.presence.activities) {
				member.presence.activities.forEach((a) => {
					if (a.type == 'CUSTOM' && a.state) {
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
			userEmbed.addField('» Presence', presenceInfo.join('\n'));

			enum statusEmojis {
				online = '787550449435803658',
				idle = '787550520956551218',
				dnd = '787550487633330176',
				offline = '787550565382750239',
				invisible = '787550565382750239'
			}
			userEmbed.setFooter(user.tag, client.emojis.cache.get(statusEmojis[member?.presence.status])?.url ?? undefined);
		}

		// roles
		if (member?.roles.cache.size && member?.roles.cache.size - 1) {
			const roles = member?.roles.cache
				.filter((role) => role.name !== '@everyone')
				.sort((role1, role2) => role2.position - role1.position)
				.map((role) => `${role}`);
			userEmbed.addField(`» Role${roles.length - 1 ? 's' : ''} [${roles.length}]`, roles.join(', '));
		}

		// Important Perms
		const perms = [];
		if (member?.permissions.has('ADMINISTRATOR') || guild?.ownerId == user.id) {
			perms.push('`Administrator`');
		} else if (member?.permissions.toArray(false).length) {
			member.permissions.toArray(false).forEach((permission) => {
				if (client.consts.mappings.permissions[permission]?.important) {
					perms.push(`\`${client.consts.mappings.permissions[permission].name}\``);
				}
			});
		}

		if (perms.length) userEmbed.addField('» Important Perms', perms.join(' '));
		if (emojis) userEmbed.setDescription(`\u200B${emojis.join('  ')}`); // zero width space
		return userEmbed
	}
}
