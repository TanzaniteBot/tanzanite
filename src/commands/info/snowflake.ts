import { BushCommand, type BushMessage, type BushSlashMessage } from '@lib';
import {
	MessageEmbed,
	SnowflakeUtil,
	VoiceChannel,
	type CategoryChannel,
	type Channel,
	type DeconstructedSnowflake,
	type DMChannel,
	type Emoji,
	type Guild,
	type NewsChannel,
	type Role,
	type Snowflake,
	type StageChannel,
	type TextChannel,
	type User
} from 'discord.js';

export default class SnowflakeCommand extends BushCommand {
	public constructor() {
		super('snowflake', {
			aliases: ['snowflake', 'info', 'sf'],
			category: 'info',
			description: {
				content: 'Provides information about the specified Snowflake.',
				usage: ['snowflake <snowflake>'],
				examples: ['snowflake 322862723090219008']
			},
			args: [
				{
					id: 'snowflake',
					type: 'snowflake',
					prompt: {
						start: 'Enter the snowflake you would like to get information about.',
						retry: '{error} Choose a valid snowflake.',
						optional: false
					}
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			slash: true,
			slashOptions: [
				{
					name: 'snowflake',
					description: 'The snowflake you would like to get information about.',
					type: 'STRING',
					required: true
				}
			]
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { snowflake: Snowflake }) {
		const snowflake = `${args.snowflake}` as Snowflake;
		const snowflakeEmbed = new MessageEmbed().setTitle('Unknown :snowflake:').setColor(util.colors.default);

		// Channel
		if (client.channels.cache.has(snowflake)) {
			const channel: Channel = client.channels.cache.get(snowflake)!;
			const channelInfo = [`**Type:** ${channel.type}`];
			if (['dm', 'group'].includes(channel.type)) {
				const _channel = channel as DMChannel;
				channelInfo.push(`**Recipient:** ${_channel.recipient.tag} (${_channel.recipient.id})`);
				snowflakeEmbed.setTitle(`:snowflake: DM with ${(channel as DMChannel).recipient.tag} \`[Channel]\``);
			} else if (
				[
					'GUILD_CATEGORY',
					'GUILD_NEWS',
					'GUILD_TEXT',
					'GUILD_VOICE',
					'GUILD_STORE',
					'GUILD_STAGE_VOICE',
					'GUILD_NEWS_THREAD',
					'GUILD_PUBLIC_THREAD',
					'GUILD_PRIVATE_THREAD'
				].includes(channel.type)
			) {
				const _channel = channel as TextChannel | VoiceChannel | NewsChannel | StageChannel | CategoryChannel | StageChannel;
				channelInfo.push(
					`**Channel Name:** <#${_channel.id}> (${_channel.name})`,
					`**Channel's Server:** ${_channel.guild.name} (${_channel.guild.id})`
				);
				snowflakeEmbed.setTitle(`:snowflake: ${_channel.name} \`[Channel]\``);
			}
			snowflakeEmbed.addField('» Channel Info', channelInfo.join('\n'));
		}

		// Guild
		if (client.guilds.cache.has(snowflake)) {
			const guild: Guild = client.guilds.cache.get(snowflake)!;
			const guildInfo = [
				`**Name:** ${guild.name}`,
				`**Owner:** ${client.users.cache.get(guild.ownerId)?.tag ?? '¯\\_(ツ)_/¯'} (${guild.ownerId})`,
				`**Members:** ${guild.memberCount?.toLocaleString()}`
			];
			if (guild.icon) snowflakeEmbed.setThumbnail(guild.iconURL({ size: 2048, dynamic: true })!);
			snowflakeEmbed.addField('» Server Info', guildInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${guild.name} \`[Server]\``);
		}

		// User
		const fetchedUser = await client.users.fetch(`${snowflake}`).catch(() => undefined);
		if (client.users.cache.has(snowflake) || fetchedUser) {
			const user: User = (client.users.cache.get(snowflake) ?? fetchedUser)!;
			const userInfo = [`**Name:** <@${user.id}> (${user.tag})`];
			if (user.avatar) snowflakeEmbed.setThumbnail(user.avatarURL({ size: 2048, dynamic: true })!);
			snowflakeEmbed.addField('» User Info', userInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${user.tag} \`[User]\``);
		}

		// Emoji
		if (client.emojis.cache.has(snowflake)) {
			const emoji: Emoji = client.emojis.cache.get(snowflake)!;
			const emojiInfo = [`**Name:** ${emoji.name}`, `**Animated:** ${emoji.animated}`];
			if (emoji.url) snowflakeEmbed.setThumbnail(emoji.url);
			snowflakeEmbed.addField('» Emoji Info', emojiInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${emoji.name} \`[Emoji]\``);
		}

		// Role
		if (message.guild && message.guild.roles.cache.has(snowflake)) {
			const role: Role = message.guild.roles.cache.get(snowflake)!;
			const roleInfo = [
				`**Name:** <@&${role.id}> (${role.name})`,
				`**Members:** ${role.members.size}`,
				`**Hoisted:** ${role.hoist}`,
				`**Managed:** ${role.managed}`,
				`**Position:** ${role.position}`,
				`**Hex Color:** ${role.hexColor}`
			];
			if (role.color) snowflakeEmbed.setColor(role.color);
			snowflakeEmbed.addField('» Role Info', roleInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${role.name} \`[Role]\``);
		}

		// SnowflakeInfo
		const deconstructedSnowflake: DeconstructedSnowflake = SnowflakeUtil.deconstruct(snowflake);
		const snowflakeInfo = [
			`**Timestamp:** ${deconstructedSnowflake.timestamp}`,
			`**Created:** ${util.timestamp(deconstructedSnowflake.date)}`,
			`**Worker ID:** ${deconstructedSnowflake.workerId}`,
			`**Process ID:** ${deconstructedSnowflake.processId}`,
			`**Increment:** ${deconstructedSnowflake.increment}`
			// `**Binary:** ${deconstructedSnowflake.binary}`
		];
		snowflakeEmbed.addField('» Snowflake Info', snowflakeInfo.join('\n'));

		return await message.util.reply({ embeds: [snowflakeEmbed] });
	}
}
