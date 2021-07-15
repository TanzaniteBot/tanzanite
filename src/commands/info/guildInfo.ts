import { Argument, Constants } from 'discord-akairo';
import { Guild, GuildPreview, MessageEmbed, Snowflake, Vanity } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

// TODO: Implement regions and security
export default class GuildInfoCommand extends BushCommand {
	public constructor() {
		super('guildInfo', {
			aliases: ['guildinfo', 'serverinfo', 'guild', 'server', 'g'],
			category: 'info',
			description: {
				content: 'Get info about a server.',
				usage: 'guildinfo [guild]',
				examples: ['guildinfo 516977525906341928']
			},
			args: [
				{
					id: 'guild',
					type: Argument.union(Constants.ArgumentTypes.GUILD, Constants.ArgumentTypes.BIGINT),
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'What server would you like to find information about?',
						retry: '{error} Choose a valid server to find information about.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'guild',
					description: 'The id of the guild you would like to find information about.',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, args: { guild: Guild | bigint | GuildPreview }): Promise<unknown> {
		if (!args?.guild && !message.guild) {
			return await message.util.reply(
				`${this.client.util.emojis.error} You must either provide an server to provide info about or run this command in a server.`
			);
		}
		let isPreview = false;
		if (['bigint', 'number', 'string'].includes(typeof args?.guild)) {
			const preview = await this.client.fetchGuildPreview(`${args.guild}` as Snowflake).catch(() => {});
			if (preview) {
				args.guild = preview;
				isPreview = true;
			} else {
				return await message.util.reply(`${this.client.util.emojis.error} That guild is not discoverable or does not exist.`);
			}
		}
		const guild: Guild | GuildPreview = (args?.guild as Guild | GuildPreview) || (message.guild as Guild);
		const emojis: string[] = [];
		const guildAbout: string[] = [];
		// const guildSecurity = [];
		if (['516977525906341928', '784597260465995796', '717176538717749358', '767448775450820639'].includes(guild.id))
			emojis.push(this.client.consts.mappings.otherEmojis.BUSH_VERIFIED);

		if (!isPreview && guild instanceof Guild) {
			if (guild.premiumTier) emojis.push(this.client.consts.mappings.otherEmojis['BOOST_' + guild.premiumTier]);
			await guild.fetch();
			const channelTypes = [
				`${this.client.consts.mappings.otherEmojis.TEXT} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_TEXT')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.NEWS} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_NEWS')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.VOICE} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_VOICE')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.STAGE} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_STAGE_VOICE')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.STORE} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_STORE')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.CATEGORY} ${guild.channels.cache
					.filter((channel) => channel.type === 'GUILD_CATEGORY')
					.size.toLocaleString()}`,
				`${this.client.consts.mappings.otherEmojis.THREAD} ${guild.channels.cache
					.filter((channel) =>
						['GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD', 'GUILD_STAGE_VOICE'].includes(channel.type)
					)
					.size.toLocaleString()}`
			];

			// TODO add guild regions
			// const guildRegions = [];

			guildAbout.push(
				`**Owner:** ${guild.members.cache.get(guild.ownerId)?.user.tag}`,
				`**Created** ${guild.createdAt.toLocaleString()}`,
				`**Members:** ${guild.memberCount.toLocaleString()}`,
				`**Online:** ${guild.approximatePresenceCount?.toLocaleString()}`,
				`**Channels:** ${guild.channels.cache.size} (${channelTypes.join(', ')})`,
				`**Emojis:** ${guild.emojis.cache.size.toLocaleString()}`
				// `**Region:** ${guildRegions.join()}`
			);
			if (guild.premiumSubscriptionCount)
				guildAbout.push(
					`**Boosts:** Level ${guild.premiumTier.slice(0, 4)} with ${guild.premiumSubscriptionCount ?? 0} boosts`
				);
			if (guild.me?.permissions.has('MANAGE_GUILD') && guild.vanityURLCode) {
				const vanityInfo: Vanity = await guild.fetchVanityData();
				guildAbout.push(
					`**Vanity URL:** discord.gg/${vanityInfo.code}`,
					`**Vanity Uses:** ${vanityInfo.uses?.toLocaleString()}`
				);
			}

			// guildSecurity.push;
		} else {
			guildAbout.push(
				`**Members:** ${guild.approximateMemberCount?.toLocaleString()}`,
				`**Online:** ${guild.approximatePresenceCount?.toLocaleString()}`,
				`**Emojis:** ${(guild as GuildPreview).emojis.size}`
			);
		}

		const guildFeatures = guild.features.sort((a, b) => {
			const aWeight = this.client.consts.mappings.features[a]?.weight;
			const bWeight = this.client.consts.mappings.features[b]?.weight;

			if (aWeight != undefined && bWeight != undefined) {
				return aWeight - bWeight;
			} else if (aWeight == undefined) {
				return 1;
			} else if (bWeight == undefined) {
				return -1;
			}
		});
		if (guildFeatures.length) {
			guildFeatures.forEach((feature) => {
				if (this.client.consts.mappings.features[feature]?.emoji) {
					emojis.push(`${this.client.consts.mappings.features[feature].emoji}`);
				} else if (this.client.consts.mappings.features[feature]?.name) {
					emojis.push(`\`${this.client.consts.mappings.features[feature].name}\``);
				} else {
					emojis.push(`\`${feature}\``);
				}
			});
		}

		if (guild.description) {
			emojis.push(`\n\n${guild.description}`);
		}

		const guildInfoEmbed = new MessageEmbed()
			.setTitle(guild.name)
			.setColor(this.client.util.colors.default)
			.addField('» About', guildAbout.join('\n'));
		const guildIcon = guild.iconURL({ size: 2048, format: 'png', dynamic: true });
		if (guildIcon) {
			guildInfoEmbed.setThumbnail(guildIcon);
		}
		// if (!isPreview) {
		// 	guildInfoEmbed.addField('» Security', guildSecurity.join('\n'));
		// }
		if (emojis) {
			guildInfoEmbed.setDescription(emojis.join('  '));
		}
		return await message.util.reply({ embeds: [guildInfoEmbed] });
	}
}
