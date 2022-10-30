import {
	akairo,
	Arg,
	BotCommand,
	colors,
	emojis,
	mappings,
	timestampAndDelta,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { embedField } from '#lib/common/tags.js';
import {
	ApplicationCommandOptionType,
	ChannelType,
	EmbedBuilder,
	escapeMarkdown,
	Guild,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	PermissionFlagsBits,
	type BaseGuildVoiceChannel,
	type GuildPreview,
	type Vanity
} from 'discord.js';
import assert from 'node:assert/strict';

export default class GuildInfoCommand extends BotCommand {
	public constructor() {
		super('guildInfo', {
			aliases: ['guild-info', 'serverinfo', 'guild', 'server', 'g'],
			category: 'info',
			description: 'Get info about a server.',
			usage: ['guild-info [guild]'],
			examples: ['guild-info 516977525906341928'],
			args: [
				{
					id: 'guild',
					description: 'The guild to find information about.',
					type: Arg.union('guild', 'snowflake'),
					readableType: 'guild|snowflake',
					prompt: 'What server would you like to find information about?',
					retry: '{error} Choose a valid server to find information about.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { guild: OptArgType<'guild' | 'snowflake'> }) {
		if (!args.guild && !message.inGuild()) {
			return await message.util.reply(
				`${emojis.error} You must either provide an server to provide info about or run this command in a server.`
			);
		}

		let guild: ArgType<'guild' | 'snowflake'> | GuildPreview = args.guild ?? message.guild!;
		if (typeof guild === 'string') {
			const preview = await this.client.fetchGuildPreview(`${args.guild}`).catch(() => {});

			if (preview) {
				guild = preview;
			} else {
				return await message.util.reply(`${emojis.error} That guild is not discoverable or does not exist.`);
			}
		}

		assert(guild);

		if (guild instanceof Guild) {
			await guild.fetch();
		}

		const guildInfoEmbed = new EmbedBuilder().setTitle(guild.name).setColor(colors.default);
		if (guild.icon) guildInfoEmbed.setThumbnail(guild.iconURL({ size: 2048, extension: 'png' }));

		await this.generateAboutField(guildInfoEmbed, guild);

		this.generateStatsField(guildInfoEmbed, guild);

		this.generateSecurityField(guildInfoEmbed, guild);

		this.generateDescription(guildInfoEmbed, guild);

		return await message.util.reply({ embeds: [guildInfoEmbed] });
	}

	private generateDescription(embed: EmbedBuilder, guild: Guild | GuildPreview) {
		const description: string[] = [];
		const otherEmojis = mappings.otherEmojis;

		const verifiedGuilds = Object.values(mappings.guilds);

		if (verifiedGuilds.includes(guild.id as typeof verifiedGuilds[number])) {
			description.push(otherEmojis.BushVerified);
		}

		if (guild instanceof Guild && guild.premiumTier !== GuildPremiumTier.None) {
			description.push(otherEmojis[`BoostTier${guild.premiumTier}`]);
		}

		const features = mappings.features;
		const guildFeatures = guild.features.sort((a, b): number => {
			const aWeight = features[a]?.weight;
			const bWeight = features[b]?.weight;

			if (aWeight !== undefined && bWeight !== undefined) return aWeight - bWeight;
			else if (aWeight === undefined) return 1;
			else if (bWeight === undefined) return -1;
			return 0;
		});

		if (guildFeatures.length) {
			guildFeatures.forEach((feature) => {
				if (features[feature]?.emoji) description.push(`${features[feature].emoji}`);
				else if (features[feature]?.name) description.push(`\`${features[feature].name}\``);
				else description.push(`\`${feature.charAt(0) + akairo.snakeToCamelCase(feature).substring(1)}\``);
			});
		}

		if (guild.description) {
			description.push(`\n\n${guild.description}`);
		}

		embed.setDescription(`\u200B${/*zero width space*/ description.join('  ')}`);
	}

	private async generateAboutField(embed: EmbedBuilder, guild: Guild | GuildPreview) {
		const guildAbout = [];

		if (guild instanceof Guild) {
			const guildRegions = [
				...new Set(
					guild.channels.cache.filter((c) => c.isVoiceBased()).map((c) => (c as BaseGuildVoiceChannel).rtcRegion ?? 'automatic')
				)
			] as RTCRegion[];

			const members = guild.memberCount;
			const online = guild.approximatePresenceCount ?? 0;
			const offline = members - online;

			guildAbout.push(
				embedField`
					Owner ${escapeMarkdown(guild.members.cache.get(guild.ownerId)?.user.tag ?? '¯\\_(ツ)_/¯')}
					Created ${timestampAndDelta(guild.createdAt, 'd')}
					Members ${members} (${emojis.onlineCircle} ${online}, ${emojis.offlineCircle} ${offline})
					Regions ${guildRegions.map((region) => mappings.regions[region] || region).join(', ')}
					Boosts ${guild.premiumSubscriptionCount && `Level ${guild.premiumTier} with ${guild.premiumSubscriptionCount} boosts`}`
			);

			if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild) && guild.vanityURLCode) {
				const vanityInfo: Vanity = await guild.fetchVanityData();
				guildAbout.push(
					embedField`
					Vanity URL ${`discord.gg/${vanityInfo.code}`}
					Vanity Uses ${vanityInfo.uses}`
				);
			}

			guildAbout.push(
				embedField`
					Icon ${guild.icon && `[link](${guild.iconURL({ size: 4096, extension: 'png' })})`}
					Banner ${guild.banner && `[link](${guild.bannerURL({ size: 4096, extension: 'png' })})`}
					Splash ${guild.splash && `[link](${guild.splashURL({ size: 4096, extension: 'png' })})`}`
			);
		} else {
			const members = guild.approximateMemberCount;
			const online = guild.approximatePresenceCount;
			const offline = members - online;

			guildAbout.push(
				embedField`
					Members ${members} (${emojis.onlineCircle} ${online}, ${emojis.offlineCircle} ${offline})
					Emojis ${guild.emojis.size}
					Stickers ${guild.stickers.size}`
			);
		}

		embed.addFields({
			name: '» About',
			// filter out anything that is undefined
			value: guildAbout.filter((v) => v !== undefined).join('\n')
		});
	}

	private generateStatsField(embed: EmbedBuilder, guild: Guild | GuildPreview) {
		if (!(guild instanceof Guild)) return;

		const channelTypes = (
			[
				['Text', [ChannelType.GuildText]],
				['Voice', [ChannelType.GuildVoice]],
				['News', [ChannelType.GuildAnnouncement]],
				['Stage', [ChannelType.GuildStageVoice]],
				['Category', [ChannelType.GuildCategory]],
				['Thread', [ChannelType.AnnouncementThread, ChannelType.PrivateThread, ChannelType.PublicThread]]
			] as const
		).map(
			(type) =>
				`${mappings.otherEmojis[`Channel${type[0]}`]} ${guild.channels.cache
					.filter((channel) => type[1].some((type) => channel.type === type))
					.size.toLocaleString()}`
		);

		const EmojiTierMap = {
			[GuildPremiumTier.Tier3]: 500,
			[GuildPremiumTier.Tier2]: 300,
			[GuildPremiumTier.Tier1]: 100,
			[GuildPremiumTier.None]: 50
		} as const;
		const StickerTierMap = {
			[GuildPremiumTier.Tier3]: 60,
			[GuildPremiumTier.Tier2]: 30,
			[GuildPremiumTier.Tier1]: 15,
			[GuildPremiumTier.None]: 0
		} as const;

		const guildStats = embedField`
			Channels ${guild.channels.cache.size} / 500 (${channelTypes.join(', ')})
			Roles ${guild.roles.cache.size - 1 /* account for @everyone role */} / 250
			Emojis ${guild.emojis.cache.size} / ${EmojiTierMap[guild.premiumTier]}
			Stickers ${guild.stickers.cache.size} / ${StickerTierMap[guild.premiumTier]}`;

		embed.addFields({ name: '» Stats', value: guildStats });
	}

	private generateSecurityField(embed: EmbedBuilder, guild: Guild | GuildPreview) {
		if (!(guild instanceof Guild)) return;

		const guildSecurity = embedField`
			Verification Level ${MappedGuildVerificationLevel[guild.verificationLevel]}
			Explicit Content Filter ${MappedGuildExplicitContentFilter[guild.explicitContentFilter]}
			Default Message Notifications ${MappedGuildDefaultMessageNotifications[guild.defaultMessageNotifications]}
			2FA Required ${guild.mfaLevel === GuildMFALevel.Elevated ? 'True' : 'False'}`;

		embed.addFields({ name: '» Security', value: guildSecurity });
	}
}

type RTCRegion =
	| 'us-west'
	| 'us-east'
	| 'us-central'
	| 'us-south'
	| 'singapore'
	| 'southafrica'
	| 'sydney'
	| 'europe'
	| 'brazil'
	| 'hongkong'
	| 'russia'
	| 'japan'
	| 'india'
	| 'automatic';

enum MappedGuildVerificationLevel {
	'None' = GuildVerificationLevel.None,
	'Low' = GuildVerificationLevel.Low,
	'Medium' = GuildVerificationLevel.Medium,
	'High' = GuildVerificationLevel.High,
	'Very High' = GuildVerificationLevel.VeryHigh
}

enum MappedGuildExplicitContentFilter {
	'Disabled' = GuildExplicitContentFilter.Disabled,
	'Members Without Roles' = GuildExplicitContentFilter.MembersWithoutRoles,
	'All Members' = GuildExplicitContentFilter.AllMembers
}

enum MappedGuildDefaultMessageNotifications {
	'All Messages' = GuildDefaultMessageNotifications.AllMessages,
	'Only Mentions' = GuildDefaultMessageNotifications.OnlyMentions
}
