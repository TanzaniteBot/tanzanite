import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { GuildMember, MessageEmbed } from 'discord.js';
import moment from 'moment';

// TODO: Allow looking up a user not in the guild and not cached
// TODO: Re-Implement Status Emojis
// TODO: Add bot information
export default class UserInfoCommand extends BushCommand {
	public constructor() {
		super('userinfo', {
			aliases: ['userinfo', 'user', 'u'],
			category: 'info',
			description: {
				usage: 'userinfo [user]',
				examples: ['userinfo 322862723090219008'],
				content: 'Gives information about a specified user.'
			},
			args: [
				{
					id: 'user',
					type: 'member',
					prompt: {
						start: 'What user would you like to find information about?',
						retry: '{error} Choose a valid user to find information about.',
						optional: true
					},
					default: null
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'The user you would like to find information about.',
					type: 'USER',
					required: false
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, args: { user: GuildMember }): Promise<unknown> {
		const user = args?.user || message.member;
		const emojis = [];
		const superUsers = this.client.cache.global.superUsers;

		const userEmbed: MessageEmbed = new MessageEmbed()
			.setTitle(user.user.tag)
			.setThumbnail(user.user.avatarURL({ size: 2048, format: 'png', dynamic: true }))
			.setTimestamp();

		// Flags
		if (this.client.config.owners.includes(user.id)) emojis.push(this.client.consts.mappings.otherEmojis.DEVELOPER);
		if (superUsers.includes(user.id)) emojis.push(this.client.consts.mappings.otherEmojis.SUPERUSER);
		const flags = user.user.flags?.toArray();
		if (flags) {
			flags.forEach((f) => {
				if (this.client.consts.mappings.userFlags[f]) {
					emojis.push(this.client.consts.mappings.userFlags[f]);
				} else emojis.push(f);
			});
		}

		// Since discord bald I just guess if someone has nitro
		if (
			Number(user.user.discriminator) < 10 ||
			this.client.consts.mappings.maybeNitroDiscrims.includes(user.user.discriminator) ||
			user.user.displayAvatarURL({ dynamic: true })?.endsWith('.gif') ||
			user.user.flags?.toArray().includes('PARTNERED_SERVER_OWNER')
		) {
			emojis.push(this.client.consts.mappings.otherEmojis.NITRO);
		}

		if (message.guild.ownerId == user.id) emojis.push(this.client.consts.mappings.otherEmojis.OWNER);
		else if (user.permissions.has('ADMINISTRATOR')) emojis.push(this.client.consts.mappings.otherEmojis.ADMIN);
		if (user.premiumSinceTimestamp) emojis.push(this.client.consts.mappings.otherEmojis.BOOSTER);

		const createdAt = user.user.createdAt.toLocaleString(),
			createdAtDelta = moment(user.user.createdAt).diff(moment()).toLocaleString(),
			joinedAt = user.joinedAt?.toLocaleString(),
			joinedAtDelta = moment(user.joinedAt)?.diff(moment()).toLocaleString(),
			premiumSince = user.premiumSince?.toLocaleString(),
			premiumSinceDelta = moment(user.premiumSince)?.diff(moment()).toLocaleString();

		// General Info
		const generalInfo = [
			`**Mention:** <@${user.id}>`,
			`**ID:** ${user.id}`,
			`**Created: **${createdAt} (${createdAtDelta} ago)`
		];
		userEmbed.addField('» General Info', generalInfo.join('\n'));

		// Server User Info
		const serverUserInfo = [];
		if (joinedAt)
			serverUserInfo.push(
				`**${message.guild.ownerId == user.id ? 'Created Server' : 'Joined'}: ** ${joinedAt} (${joinedAtDelta} ago)`
			);
		if (premiumSince) serverUserInfo.push(`**Boosting Since:** ${premiumSince} (${premiumSinceDelta} ago)`);
		if (user.displayHexColor) serverUserInfo.push(`**Display Color:** ${user.displayHexColor}`);
		if (user.id == '322862723090219008' && message.guild.id == this.client.consts.mappings.guilds.bush)
			serverUserInfo.push(`**General Deletions:** 2`);
		if (
			['384620942577369088', '496409778822709251'].includes(user.id) &&
			message.guild.id == this.client.consts.mappings.guilds.bush
		)
			serverUserInfo.push(`**General Deletions:** 1`);
		if (user.nickname) serverUserInfo.push(`**Nickname** ${user.nickname}`);
		if (serverUserInfo.length)
			userEmbed
				.addField('» Server Info', serverUserInfo.join('\n'))
				.setColor(user.displayColor || this.client.util.colors.default);

		// User Presence Info
		if (user.presence?.status || user.presence?.clientStatus || user.presence?.activities) {
			let customStatus = '';
			const activitiesNames = [];
			if (user.presence.activities) {
				user.presence.activities.forEach((a) => {
					if (a.type == 'CUSTOM' && a.state) {
						const emoji = `${a.emoji ? `${a.emoji.toString()} ` : ''}`;
						customStatus = `${emoji}${a.state}`;
					}
					activitiesNames.push(`\`${a.name}\``);
				});
			}
			let devices;
			if (user.presence.clientStatus) devices = Object.keys(user.presence.clientStatus);
			const presenceInfo = [];
			if (user.presence.status) presenceInfo.push(`**Status:** ${user.presence.status}`);
			if (devices)
				presenceInfo.push(`**${devices.length - 1 ? 'Devices' : 'Device'}:** ${this.client.util.oxford(devices, 'and', '')}`);
			if (activitiesNames.length)
				presenceInfo.push(
					`**Activit${activitiesNames.length - 1 ? 'ies' : 'y'}:** ${this.client.util.oxford(activitiesNames, 'and', '')}`
				);
			if (customStatus) presenceInfo.push(`**Custom Status:** ${customStatus}`);
			userEmbed.addField('» Presence', presenceInfo.join('\n'));
		}

		// Important Perms
		const perms = [];
		if (user.permissions.has('ADMINISTRATOR') || message.guild.ownerId == user.id) {
			perms.push('`Administrator`');
		} else {
			user.permissions.toArray(true).forEach((permission) => {
				if (this.client.consts.mappings.permissions[permission]?.important) {
					perms.push(`\`${this.client.consts.mappings.permissions[permission].name}\``);
				}
			});
		}

		if (perms.length) userEmbed.addField('» Important Perms', perms.join(' '));
		if (emojis) userEmbed.setDescription(emojis.join('  '));

		return await message.util.reply({ embeds: [userEmbed] });
	}
}
