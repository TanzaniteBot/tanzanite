import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import assert from 'assert';
import { GuildDefaultMessageNotifications, GuildExplicitContentFilter } from 'discord-api-types';
import {
	ApplicationCommandOptionType,
	Embed,
	Guild,
	GuildMFALevel,
	GuildPremiumTier,
	GuildVerificationLevel,
	PermissionFlagsBits,
	type BaseGuildVoiceChannel,
	type GuildPreview,
	type Snowflake,
	type Vanity
} from 'discord.js';

export default class GuildInfoCommand extends BushCommand {
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
					type: util.arg.union('guild', 'snowflake'),
					readableType: 'guild|snowflake',
					prompt: 'What server would you like to find information about?',
					retry: '{error} Choose a valid server to find information about.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { guild: OptionalArgType<'guild'> | OptionalArgType<'snowflake'> }
	) {
		if (!args.guild && !message.inGuild()) {
			return await message.util.reply(
				`${util.emojis.error} You must either provide an server to provide info about or run this command in a server.`
			);
		}

		const otherEmojis = client.consts.mappings.otherEmojis;
		let isPreview = false;
		let _guild: ArgType<'guild'> | ArgType<'snowflake'> | GuildPreview = args.guild ?? message.guild!;
		if (typeof _guild === 'string') {
			const preview = await client.fetchGuildPreview(`${args.guild}` as Snowflake).catch(() => {});
			if (preview) {
				_guild = preview;
				isPreview = true;
			} else {
				return await message.util.reply(`${util.emojis.error} That guild is not discoverable or does not exist.`);
			}
		}

		const guild: Guild | GuildPreview = _guild;
		assert(guild);
		const emojis: string[] = [];
		const guildAbout: string[] = [];
		const guildStats: string[] = [];
		const guildSecurity: string[] = [];
		const verifiedGuilds = Object.values(client.consts.mappings.guilds);
		if (verifiedGuilds.includes(guild.id as typeof verifiedGuilds[number])) emojis.push(otherEmojis.BushVerified);

		if (!isPreview && guild instanceof Guild) {
			if (guild.premiumTier !== GuildPremiumTier.None) emojis.push(otherEmojis[`BoostTier${guild.premiumTier}`]);
			await guild.fetch();
			const channels = guild.channels.cache;

			const channelTypes = (['Text', 'Voice', 'News', 'Stage', 'Store', 'Category', 'Thread'] as const).map(
				(type) => `${otherEmojis[`Channel${type}`]} ${channels.filter((channel) => channel[`is${type}`]()).size.toLocaleString()}`
			);

			const guildRegions = [
				...new Set(
					guild.channels.cache.filter((c) => c.isVoiceBased()).map((c) => (c as BaseGuildVoiceChannel).rtcRegion ?? 'automatic')
				)
			] as RTCRegion[];

			guildAbout.push(
				`**Owner:** ${util.discord.escapeMarkdown(guild.members.cache.get(guild.ownerId)?.user.tag ?? '¯\\_(ツ)_/¯')}`,
				`**Created** ${util.timestamp(guild.createdAt)} (${util.dateDelta(guild.createdAt)})`,
				`**Members:** ${guild.memberCount.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(guild.memberCount - (guild.approximatePresenceCount ?? 0)).toLocaleString() ?? 0})`,
				`**Regions:** ${guildRegions.map((region) => client.consts.mappings.regions[region] || region).join(', ')}`
			);
			if (guild.premiumSubscriptionCount)
				guildAbout.push(`**Boosts:** Level ${guild.premiumTier} with ${guild.premiumSubscriptionCount ?? 0} boosts`);
			if (guild.me?.permissions.has(PermissionFlagsBits.ManageGuild) && guild.vanityURLCode) {
				const vanityInfo: Vanity = await guild.fetchVanityData();
				guildAbout.push(`**Vanity URL:** discord.gg/${vanityInfo.code}`, `**Vanity Uses:** ${vanityInfo.uses?.toLocaleString()}`);
			}

			if (guild.icon) guildAbout.push(`**Icon:** [link](${guild.iconURL({ size: 4096, extension: 'png' })})`);
			if (guild.banner) guildAbout.push(`**Banner:** [link](${guild.bannerURL({ size: 4096, extension: 'png' })})`);
			if (guild.splash) guildAbout.push(`**Splash:** [link](${guild.splashURL({ size: 4096, extension: 'png' })})`);

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

			guildStats.push(
				`**Channels:** ${guild.channels.cache.size.toLocaleString()} / 500 (${channelTypes.join(', ')})`,
				// subtract 1 for @everyone role
				`**Roles:** ${((guild.roles.cache.size ?? 0) - 1).toLocaleString()} / 250`,
				`**Emojis:** ${guild.emojis.cache.size?.toLocaleString() ?? 0} / ${EmojiTierMap[guild.premiumTier]}`,
				`**Stickers:** ${guild.stickers.cache.size?.toLocaleString() ?? 0} / ${StickerTierMap[guild.premiumTier]}`
			);

			guildSecurity.push(
				`**Verification Level:** ${BushGuildVerificationLevel[guild.verificationLevel]}`,
				`**Explicit Content Filter:** ${BushGuildExplicitContentFilter[guild.explicitContentFilter]}`,
				`**Default Message Notifications:** ${BushGuildDefaultMessageNotifications[guild.defaultMessageNotifications]}`,
				`**2FA Required:** ${guild.mfaLevel === GuildMFALevel.Elevated ? 'True' : 'False'}`
			);
		} else {
			guildAbout.push(
				`**Members:** ${guild.approximateMemberCount?.toLocaleString() ?? 0} (${util.emojis.onlineCircle} ${
					guild.approximatePresenceCount?.toLocaleString() ?? 0
				}, ${util.emojis.offlineCircle} ${(
					(guild.approximateMemberCount ?? 0) - (guild.approximatePresenceCount ?? 0)
				).toLocaleString()})`,
				`**Emojis:** ${(guild as GuildPreview).emojis.size?.toLocaleString() ?? 0}`,
				`**Stickers:** ${(guild as GuildPreview).stickers.size}`
			);
		}

		const features = client.consts.mappings.features;
		const guildFeatures = guild.features.sort((a, b): number => {
			const aWeight = features[a]?.weight;
			const bWeight = features[b]?.weight;

			if (aWeight !== undefined && bWeight !== undefined) return aWeight - bWeight;
			else if (aWeight == undefined) return 1;
			else if (bWeight == undefined) return -1;
			return 0;
		});
		if (guildFeatures.length) {
			guildFeatures.forEach((feature) => {
				if (features[feature]?.emoji) emojis.push(`${features[feature].emoji}`);
				else if (features[feature]?.name) emojis.push(`\`${features[feature].name}\``);
				else emojis.push(`\`${feature}\``);
			});
		}

		if (guild.description) {
			emojis.push(`\n\n${guild.description}`);
		}

		const guildInfoEmbed = new Embed()
			.setTitle(guild.name)
			.setColor(util.colors.default)
			.addField({ name: '» About', value: guildAbout.join('\n') });
		if (guildStats.length) guildInfoEmbed.addField({ name: '» Stats', value: guildStats.join('\n') });
		const guildIcon = guild.iconURL({ size: 2048, extension: 'png' });
		if (guildIcon) {
			guildInfoEmbed.setThumbnail(guildIcon);
		}
		if (!isPreview) {
			guildInfoEmbed.addField({ name: '» Security', value: guildSecurity.join('\n') });
		}
		if (emojis) {
			guildInfoEmbed.setDescription(`\u200B${/*zero width space*/ emojis.join('  ')}`);
		}
		return await message.util.reply({ embeds: [guildInfoEmbed] });
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

enum BushGuildVerificationLevel {
	'None' = GuildVerificationLevel.None,
	'Low' = GuildVerificationLevel.Low,
	'Medium' = GuildVerificationLevel.Medium,
	'High' = GuildVerificationLevel.High,
	'Very High' = GuildVerificationLevel.VeryHigh
}

enum BushGuildExplicitContentFilter {
	'Disabled' = GuildExplicitContentFilter.Disabled,
	'Members Without Roles' = GuildExplicitContentFilter.MembersWithoutRoles,
	'All Members' = GuildExplicitContentFilter.AllMembers
}

enum BushGuildDefaultMessageNotifications {
	'All Messages' = GuildDefaultMessageNotifications.AllMessages,
	'Only Mentions' = GuildDefaultMessageNotifications.OnlyMentions
}
