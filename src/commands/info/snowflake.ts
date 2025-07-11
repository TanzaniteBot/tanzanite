import {
	AllIntegrationTypes,
	AllInteractionContexts,
	AllowedMentions,
	BotCommand,
	colors,
	emojis,
	regex,
	timestamp,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { input } from '#lib/utils/Format.js';
import { embedField } from '#tags';
import {
	ApplicationCommandOptionType,
	ChannelType,
	EmbedBuilder,
	SnowflakeUtil,
	escapeMarkdown,
	type DeconstructedSnowflake
} from 'discord.js';

export default class SnowflakeCommand extends BotCommand {
	public constructor() {
		super('snowflake', {
			aliases: ['snowflake', 'info', 'sf'],
			category: 'info',
			description: 'Provides information about the specified Snowflake.',
			usage: ['snowflake <snowflake>'],
			examples: ['snowflake 322862723090219008'],
			args: [
				{
					id: 'snowflake',
					description: 'The snowflake you would like to get information about.',
					type: 'snowflake',
					prompt: 'What snowflake would you like to get information about?',
					retry: '{error} Choose a valid snowflake.',
					slashType: ApplicationCommandOptionType.String
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

	public override async exec(message: CommandMessage | SlashMessage, args: { snowflake: ArgType<'snowflake'> }) {
		if (!regex.snowflake.test(args.snowflake)) {
			return message.util.reply({
				content: `${emojis.error} ${input(args.snowflake)} is not a valid snowflake.`,
				allowedMentions: AllowedMentions.none()
			});
		}

		const snowflake = `${args.snowflake}`;
		const snowflakeEmbed = new EmbedBuilder().setTitle('Unknown :snowflake:').setColor(colors.default);

		// Channel
		if (this.client.channels.cache.has(snowflake)) {
			const channel = this.client.channels.resolve(snowflake)!;
			const channelInfo = [`**Type:** ${MappedChannelType[channel.type] ?? ChannelType[channel.type]}`];
			if (channel.type === ChannelType.DM) {
				channelInfo.push(
					`**Recipient:** ${escapeMarkdown(channel.recipient?.tag ?? '¯\\_(ツ)_/¯')} (${channel.recipient?.id ?? '¯\\_(ツ)_/¯'})`
				);
				snowflakeEmbed.setTitle(`:snowflake: DM with ${escapeMarkdown(channel.recipient?.tag ?? '¯\\_(ツ)_/¯')} \`[Channel]\``);
			} else if (
				channel.type === ChannelType.GuildCategory ||
				channel.type === ChannelType.GuildAnnouncement ||
				channel.type === ChannelType.GuildText ||
				channel.type === ChannelType.GuildVoice ||
				channel.type === ChannelType.GuildStageVoice ||
				channel.isThread()
			) {
				channelInfo.push(
					`**Channel Name:** <#${channel.id}> (${escapeMarkdown(channel.name)})`,
					`**Channel's Server:** ${escapeMarkdown(channel.guild.name)} (${channel.guild.id})`
				);
				snowflakeEmbed.setTitle(`:snowflake: ${escapeMarkdown(channel.name)} \`[Channel]\``);
			}
			snowflakeEmbed.addFields({ name: '» Channel Info', value: channelInfo.join('\n') });
		}

		// Guild
		if (this.client.guilds.cache.has(snowflake)) {
			const guild = this.client.guilds.cache.get(snowflake)!;
			const guildInfo = embedField`
				Name ${escapeMarkdown(guild.name)}
				Owner ${escapeMarkdown(this.client.users.cache.get(guild.ownerId)?.tag ?? '¯\\_(ツ)_/¯')} (${guild.ownerId})
				Members ${guild.memberCount?.toLocaleString()}`;
			if (guild.icon != null) snowflakeEmbed.setThumbnail(guild.iconURL({ size: 2048 }));
			snowflakeEmbed.addFields({ name: '» Server Info', value: guildInfo });
			snowflakeEmbed.setTitle(`:snowflake: ${escapeMarkdown(guild.name)} \`[Server]\``);
		}

		// User
		const fetchedUser = await this.client.users.fetch(`${snowflake}`).catch(() => undefined);
		if (this.client.users.cache.has(snowflake) || fetchedUser) {
			const user = (this.client.users.cache.get(snowflake) ?? fetchedUser)!;
			const userInfo = embedField`
				Name ${`<@${user.id}> (${escapeMarkdown(user.tag)})`}`;
			if (user.avatar != null) snowflakeEmbed.setThumbnail(user.avatarURL({ size: 2048 }));
			snowflakeEmbed.addFields({ name: '» User Info', value: userInfo });
			snowflakeEmbed.setTitle(`:snowflake: ${escapeMarkdown(user.tag)} \`[User]\``);
		}

		// Emoji
		if (this.client.guilds.cache.some((g) => g.emojis.cache.has(snowflake))) {
			const emoji = this.client.guilds.cache.find((g) => g.emojis.cache.has(snowflake))!.emojis.cache.get(snowflake)!;
			const emojiInfo = embedField`
				Name ${escapeMarkdown(emoji.name ?? '¯\\_(ツ)_/¯')}
				Animated ${emoji.animated}`;
			const url = emoji.imageURL();
			if (url) snowflakeEmbed.setThumbnail(url);
			snowflakeEmbed.addFields({ name: '» Emoji Info', value: emojiInfo });
			snowflakeEmbed.setTitle(`:snowflake: ${escapeMarkdown(emoji.name ?? '¯\\_(ツ)_/¯')} \`[Emoji]\``);
		}

		// Role
		if (message.guild && message.guild.roles.cache.has(snowflake)) {
			const role = message.guild.roles.cache.get(snowflake)!;
			const roleInfo = embedField`
				Name ${`<@&${role.id}> (${escapeMarkdown(role.name)})`}
				Members ${role.members.size}
				Hoisted ${role.hoist}
				Managed ${role.managed}
				Position ${role.position}
				Hex Color ${role.hexColor}`;
			if (role.color) snowflakeEmbed.setColor(role.color);
			snowflakeEmbed.addFields({ name: '» Role Info', value: roleInfo });
			snowflakeEmbed.setTitle(`:snowflake: ${escapeMarkdown(role.name)} \`[Role]\``);
		}

		// SnowflakeInfo
		const deconstructedSnowflake: DeconstructedSnowflake = SnowflakeUtil.deconstruct(snowflake);
		const snowflakeInfo = embedField`
			Timestamp ${deconstructedSnowflake.timestamp}
			Created ${timestamp(new Date(Number(deconstructedSnowflake.timestamp)))}
			Worker ID ${deconstructedSnowflake.workerId}
			Process ID ${deconstructedSnowflake.processId}
			Increment ${deconstructedSnowflake.increment}`;
		snowflakeEmbed.addFields({ name: '» Snowflake Info', value: snowflakeInfo });

		return await message.util.reply({ embeds: [snowflakeEmbed] });
	}
}

enum MappedChannelType {
	'Text' = 0,
	'DM' = 1,
	'Voice' = 2,
	'Group DM' = 3,
	'Category' = 4,
	'Announcement' = 5,
	'Announcement Store' = 6,
	'News Thread' = 10,
	'Public Thread' = 11,
	'Private Thread' = 12,
	'Stage' = 13
}
