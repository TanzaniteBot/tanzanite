import { bots, emojis, mappings, Time } from '#lib/utils/Constants.js';
import { formatList, sleep, timestampAndDelta } from '#lib/utils/Utils.js';
import {
	ActivityType,
	ApplicationFlagsBitField,
	escapeMarkdown,
	type APIApplication,
	type APIEmbedField,
	type APIEmbedFooter,
	type ApplicationFlagsString,
	type GuildMember,
	type User
} from 'discord.js';
import { embedField } from '../tags.js';

export async function generateGeneralInfoField(user: User, title = '» General Information'): Promise<APIEmbedField> {
	const pronouns = await Promise.race([
		user.client.utils.getPronounsOf(user),
		// cut off request after 2 seconds
		sleep(2 * Time.Second)
	]);

	const generalInfo = embedField`
		Mention ${`<@${user.id}>`}
		ID ${user.id}
		Created ${timestampAndDelta(user.createdAt, 'd')}
		Accent Color ${user.hexAccentColor}
		Banner ${user.banner && `[link](${user.bannerURL({ extension: 'png', size: 4096 })})`}
		Pronouns ${typeof pronouns === 'string' && pronouns !== 'Unspecified' && pronouns}`;

	return { name: title, value: generalInfo };
}

export function generateServerInfoField(member?: GuildMember, title = '» Server Information'): APIEmbedField | null {
	if (!member) return null;

	const isGuildOwner = member.guild.ownerId === member.id;

	const deletions = (() => {
		if (member.guild.id !== mappings.guilds["Moulberry's Bush"]) return null;

		switch (member.id) {
			case mappings.users['IRONM00N']:
				return '1⅓';
			case mappings.users['nopo']:
			case mappings.users['Bestower']:
				return '⅓';
			default:
				return null;
		}
	})();

	const serverUserInfo = embedField`
		Created Server ${member.joinedAt && isGuildOwner && timestampAndDelta(member.joinedAt, 'd')}
		Joined ${member.joinedAt && !isGuildOwner && timestampAndDelta(member.joinedAt, 'd')}
		Booster Since ${member.premiumSince && timestampAndDelta(member.premiumSince, 'd')}
		Display Color ${member.displayHexColor}
		#general Deletions ${deletions}
		Nickname ${member.nickname && escapeMarkdown(member.nickname)}`;

	return serverUserInfo.length ? { name: title, value: serverUserInfo } : null;
}

export function generatePresenceField(member?: GuildMember, title = '» Presence'): APIEmbedField | null {
	if (!member?.presence) return null;
	if (!member.presence.status && !member.presence.clientStatus && !member.presence.activities) return null;

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
	if (member.presence.clientStatus) devices = Object.keys(member.presence.clientStatus);
	const presenceInfo = [];
	if (member.presence.status) presenceInfo.push(`**Status:** ${member.presence.status}`);
	if (devices && devices.length)
		presenceInfo.push(`**${devices.length - 1 ? 'Devices' : 'Device'}:** ${formatList(devices, 'and')}`);
	if (activitiesNames.length)
		presenceInfo.push(`**Activit${activitiesNames.length - 1 ? 'ies' : 'y'}:** ${formatList(activitiesNames, 'and')}`);
	if (customStatus && customStatus.length) presenceInfo.push(`**Custom Status:** ${escapeMarkdown(customStatus)}`);

	return { name: title, value: presenceInfo.join('\n') };
}

export function generatePresenceFooter(member?: GuildMember): APIEmbedFooter | null {
	if (!member?.presence?.status) return null;

	/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
	enum statusEmojis {
		online = '787550449435803658',
		idle = '787550520956551218',
		dnd = '787550487633330176',
		offline = '787550565382750239',
		invisible = '787550565382750239'
	}
	/* eslint-enable @typescript-eslint/no-duplicate-enum-values */

	return {
		text: member.user.tag,
		icon_url: member.client.emojis.cache.get(statusEmojis[member.presence.status])?.imageURL() ?? undefined
	};
}

export function generateRolesField(member?: GuildMember): APIEmbedField | null {
	if (!member || member.roles.cache.size <= 1) return null;

	// roles
	const roles = member.roles.cache
		.filter((role) => role.name !== '@everyone')
		.sort((role1, role2) => role2.position - role1.position)
		.map((role) => `${role}`);

	const joined = roles.join(', ');

	return {
		name: `» Role${roles.length - 1 ? 's' : ''} [${roles.length}]`,
		value: joined.length > 1024 ? 'Too Many Roles to Display...' : joined
	};
}

export function generatePermissionsField(
	member: GuildMember | undefined,
	title = '» Important Permissions'
): APIEmbedField | null {
	if (!member) return null;

	const perms = getImportantPermissions(member);

	return perms.length ? { name: title, value: perms.join(' ') } : null;
}

function getImportantPermissions(member: GuildMember | undefined) {
	if (member == null || member.guild == null) return [];

	if (member.permissions.has('Administrator') || member.guild.ownerId === member.user.id) {
		return ['`Administrator`'];
	}

	const important = member.permissions
		.toArray()
		.filter((p) => mappings.permissions[p]?.important === true)
		.map((p) => `\`${mappings.permissions[p].name}\``);

	return important;
}

export async function generateBotField(user: User, title = '» Bot Information'): Promise<APIEmbedField | null> {
	if (!user.bot) return null;

	// very old bots have different bot vs user ids
	const applicationId = bots[user.id]?.applicationId ?? user.id;

	const applicationInfo = (await user.client.rest
		.get(`/applications/${applicationId}/rpc`)
		.catch(() => null)) as APIApplication | null;
	if (!applicationInfo) return null;

	const flags = new ApplicationFlagsBitField(applicationInfo.flags);

	const intent = (check: ApplicationFlagsString, warn: ApplicationFlagsString) => {
		if (flags.has(check)) return emojis.check;
		if (flags.has(warn)) return emojis.warn;
		return emojis.cross;
	};

	const botInfo = embedField`
		Publicity ${applicationInfo.bot_public ? 'Public' : 'Private'}
		Code Grant ${applicationInfo.bot_require_code_grant ? 'Required' : 'Not Required'}
		Server Members Intent ${intent('GatewayGuildMembers', 'GatewayGuildMembersLimited')}
		Presence Intent ${intent('GatewayPresence', 'GatewayPresenceLimited')}
		Message Content Intent ${intent('GatewayMessageContent', 'GatewayMessageContentLimited')}`;

	return { name: title, value: botInfo };
}
