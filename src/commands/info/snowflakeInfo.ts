import {
	CategoryChannel,
	Channel,
	DeconstructedSnowflake,
	DMChannel,
	Emoji,
	Guild,
	MessageEmbed,
	NewsChannel,
	Role,
	Snowflake,
	SnowflakeUtil,
	StageChannel,
	TextChannel,
	User,
	VoiceChannel
} from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class SnowflakeInfoCommand extends BushCommand {
	public constructor() {
		super('snowflake', {
			aliases: ['snowflake', 'info', 'sf'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			description: {
				content: 'Provides information about the specified Snowflake.',
				usage: 'snowflake <snowflake>',
				examples: ['snowflake 322862723090219008']
			},
			args: [
				{
					id: 'snowflake',
					type: 'bigint',
					prompt: {
						start: 'Enter the snowflake you would like to get information about.',
						retry: '{error} Choose a valid snowflake.',
						optional: false
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
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
	public async exec(message: BushMessage | BushSlashMessage, args: { snowflake: bigint }): Promise<unknown> {
		const snowflake = `${args.snowflake}` as Snowflake;
		const snowflakeEmbed = new MessageEmbed().setTitle('Unknown :snowflake:').setColor(util.colors.default);

		// Channel
		if (this.client.channels.cache.has(snowflake)) {
			const channel: Channel = this.client.channels.cache.get(snowflake);
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
		else if (this.client.guilds.cache.has(snowflake)) {
			const guild: Guild = this.client.guilds.cache.get(snowflake);
			const guildInfo = [
				`**Name:** ${guild.name}`,
				`**Owner:** ${this.client.users.cache.get(guild.ownerId)?.tag || '¯\\_(ツ)_/¯'} (${guild.ownerId})`,
				`**Members:** ${guild.memberCount?.toLocaleString()}`
			];
			snowflakeEmbed.setThumbnail(guild.iconURL({ size: 2048, dynamic: true }));
			snowflakeEmbed.addField('» Server Info', guildInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${guild.name} \`[Server]\``);
		}

		// User
		else if (this.client.users.cache.has(snowflake)) {
			const user: User = this.client.users.cache.get(snowflake);
			const userInfo = [`**Name:** <@${user.id}> (${user.tag})`];
			snowflakeEmbed.setThumbnail(user.avatarURL({ size: 2048, dynamic: true }));
			snowflakeEmbed.addField('» User Info', userInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${user.tag} \`[User]\``);
		}

		// Emoji
		else if (this.client.emojis.cache.has(snowflake)) {
			const emoji: Emoji = this.client.emojis.cache.get(snowflake);
			const emojiInfo = [`**Name:** ${emoji.name}`, `**Animated:** ${emoji.animated}`];
			snowflakeEmbed.setThumbnail(emoji.url);
			snowflakeEmbed.addField('» Emoji Info', emojiInfo.join('\n'));
			snowflakeEmbed.setTitle(`:snowflake: ${emoji.name} \`[Emoji]\``);
		}

		// Role
		else if (message.guild.roles.cache.has(snowflake)) {
			const role: Role = message.guild.roles.cache.get(snowflake);
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
			`**Created:** ${deconstructedSnowflake.date.toLocaleString()}`,
			`**Worker ID:** ${deconstructedSnowflake.workerId}`,
			`**Process ID:** ${deconstructedSnowflake.processId}`,
			`**Increment:** ${deconstructedSnowflake.increment}`
			// `**Binary:** ${deconstructedSnowflake.binary}`
		];
		snowflakeEmbed.addField('» Snowflake Info', snowflakeInfo.join('\n'));

		return await message.util.reply({ embeds: [snowflakeEmbed] });
	}
}
