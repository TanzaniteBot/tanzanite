import { ChannelType, type Snowflake } from 'discord.js';
import { type Sequelize } from 'sequelize';
import { BadWordDetails } from '../../common/AutoMod.js';
import { type BushClient } from '../../extensions/discord-akairo/BushClient.js';
import { BaseModel } from '../BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

export interface GuildModel {
	id: Snowflake;
	prefix: string;
	autoPublishChannels: Snowflake[];
	blacklistedChannels: Snowflake[];
	blacklistedUsers: Snowflake[];
	welcomeChannel: Snowflake;
	muteRole: Snowflake;
	punishmentEnding: string;
	disabledCommands: string[];
	lockdownChannels: Snowflake[];
	autoModPhases: BadWordDetails[];
	enabledFeatures: GuildFeatures[];
	joinRoles: Snowflake[];
	logChannels: LogChannelDB;
	bypassChannelBlacklist: Snowflake[];
	noXpChannels: Snowflake[];
	levelRoles: { [level: number]: Snowflake };
	levelUpChannel: Snowflake;
}

export interface GuildModelCreationAttributes {
	id: Snowflake;
	prefix?: string;
	autoPublishChannels?: Snowflake[];
	blacklistedChannels?: Snowflake[];
	blacklistedUsers?: Snowflake[];
	welcomeChannel?: Snowflake;
	muteRole?: Snowflake;
	punishmentEnding?: string;
	disabledCommands?: string[];
	lockdownChannels?: Snowflake[];
	autoModPhases?: BadWordDetails[];
	enabledFeatures?: GuildFeatures[];
	joinRoles?: Snowflake[];
	logChannels?: LogChannelDB;
	bypassChannelBlacklist?: Snowflake[];
	noXpChannels?: Snowflake[];
	levelRoles?: { [level: number]: Snowflake };
	levelUpChannel?: Snowflake;
}

export class Guild extends BaseModel<GuildModel, GuildModelCreationAttributes> implements GuildModel {
	/**
	 * The ID of the guild
	 */
	public declare id: Snowflake;

	/**
	 * The bot's prefix for the guild
	 */
	public declare prefix: string;

	/**
	 * Channels that will have their messages automatically published
	 */
	public declare autoPublishChannels: Snowflake[];

	/**
	 * Channels where the bot won't respond in.
	 */
	public declare blacklistedChannels: Snowflake[];

	/**
	 * Users that the bot ignores in this guild
	 */
	public declare blacklistedUsers: Snowflake[];

	/**
	 * The channels where the welcome messages are sent
	 */
	public declare welcomeChannel: Snowflake;

	/**
	 * The role given out when muting someone
	 */
	public declare muteRole: Snowflake;

	/**
	 * The message that gets sent after someone gets a punishment dm
	 */
	public declare punishmentEnding: string;

	/**
	 * Guild specific disabled commands
	 */
	public declare disabledCommands: string[];

	/**
	 * Channels that should get locked down when the lockdown command gets used.
	 */
	public declare lockdownChannels: Snowflake[];

	/**
	 * Custom automod phases
	 */
	public declare autoModPhases: BadWordDetails[];

	/**
	 * The features enabled in a guild
	 */
	public declare enabledFeatures: GuildFeatures[];

	/**
	 * The roles to assign to a user if they are not assigned sticky roles
	 */
	public declare joinRoles: Snowflake[];

	/**
	 * The channels where logging messages will be sent.
	 */
	public declare logChannels: LogChannelDB;

	/**
	 * These users will be able to use commands in channels blacklisted
	 */
	public declare bypassChannelBlacklist: Snowflake[];

	/**
	 * Channels where users will not earn xp for leveling.
	 */
	public declare noXpChannels: Snowflake[];

	/**
	 * What roles get given to users when they reach certain levels.
	 */
	public declare levelRoles: { [level: number]: Snowflake };

	/**
	 * The channel to send level up messages in instead of last channel.
	 */
	public declare levelUpChannel: Snowflake;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize, client: BushClient): void {
		Guild.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true },
				prefix: { type: DataTypes.TEXT, allowNull: false, defaultValue: client.config.prefix },
				autoPublishChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedUsers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				welcomeChannel: { type: DataTypes.STRING, allowNull: true },
				muteRole: { type: DataTypes.STRING, allowNull: true },
				punishmentEnding: { type: DataTypes.TEXT, allowNull: true },
				disabledCommands: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				lockdownChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				autoModPhases: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				enabledFeatures: {
					type: DataTypes.JSONB,
					allowNull: false,
					defaultValue: Object.keys(guildFeaturesObj).filter(
						(key) => guildFeaturesObj[key as keyof typeof guildFeaturesObj].default
					)
				},
				joinRoles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				logChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
				bypassChannelBlacklist: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				noXpChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				levelRoles: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
				levelUpChannel: { type: DataTypes.STRING, allowNull: true }
			},
			{ sequelize }
		);
	}
}

export type BaseGuildSetting = 'channel' | 'role' | 'user';
export type GuildSettingType = 'string' | 'custom' | BaseGuildSetting | `${BaseGuildSetting}-array`;

export interface GuildSetting {
	name: string;
	description: string;
	type: GuildSettingType;
	subType: ChannelType[] | undefined;
	configurable: boolean;
}
const asGuildSetting = <T>(et: { [K in keyof T]: GuildSetting }) => et;

export const guildSettingsObj = asGuildSetting({
	prefix: {
		name: 'Prefix',
		description: 'The phrase required to trigger text commands in this server.',
		type: 'string',
		subType: undefined,
		configurable: true
	},
	autoPublishChannels: {
		name: 'Auto Publish Channels',
		description: 'Channels were every message is automatically published.',
		type: 'channel-array',
		subType: [ChannelType.GuildNews],
		configurable: true
	},
	welcomeChannel: {
		name: 'Welcome Channel',
		description: 'The channel where the bot will send join and leave message.',
		type: 'channel',
		subType: [
			ChannelType.GuildText,
			ChannelType.GuildNews,
			ChannelType.GuildNewsThread,
			ChannelType.GuildPublicThread,
			ChannelType.GuildPrivateThread
		],
		configurable: true
	},
	muteRole: {
		name: 'Mute Role',
		description: 'The role assigned when muting someone.',
		type: 'role',
		subType: undefined,
		configurable: true
	},
	punishmentEnding: {
		name: 'Punishment Ending',
		description: 'The message after punishment information to a user in a dm.',
		type: 'string',
		subType: undefined,
		configurable: true
	},
	lockdownChannels: {
		name: 'Lockdown Channels',
		description: 'Channels that are locked down when a mass lockdown is specified.',
		type: 'channel-array',
		subType: [ChannelType.GuildText],
		configurable: true
	},
	joinRoles: {
		name: 'Join Roles',
		description: 'Roles assigned to users on join who do not have sticky role information.',
		type: 'role-array',
		subType: undefined,
		configurable: true
	},
	bypassChannelBlacklist: {
		name: 'Bypass Channel Blacklist',
		description: 'These users will be able to use commands in channels blacklisted.',
		type: 'user-array',
		subType: undefined,
		configurable: true
	},
	logChannels: {
		name: 'Log Channels',
		description: 'The channel were logs are sent.',
		type: 'custom',
		subType: [ChannelType.GuildText],
		configurable: false
	},
	autoModPhases: {
		name: 'Automod Phases',
		description: 'Custom phrases to be detected by automod.',
		type: 'custom',
		subType: undefined,
		configurable: false
	},
	noXpChannels: {
		name: 'No Xp Channels',
		description: 'Channels where users will not earn xp for leveling.',
		type: 'channel-array',
		subType: [
			ChannelType.GuildText,
			ChannelType.GuildNews,
			ChannelType.GuildNewsThread,
			ChannelType.GuildPublicThread,
			ChannelType.GuildPrivateThread
		],
		configurable: true
	},
	levelRoles: {
		name: 'Level Roles',
		description: 'What roles get given to users when they reach certain levels.',
		type: 'custom',
		subType: undefined,
		configurable: false
	},
	levelUpChannel: {
		name: 'Level Up Channel',
		description: 'The channel to send level up messages in instead of last channel.',
		type: 'channel',
		subType: [
			ChannelType.GuildText,
			ChannelType.GuildNews,
			ChannelType.GuildNewsThread,
			ChannelType.GuildPublicThread,
			ChannelType.GuildPrivateThread
		],
		configurable: true
	}
});

export type GuildSettings = keyof typeof guildSettingsObj;
export const settingsArr = Object.keys(guildSettingsObj).filter(
	(s) => guildSettingsObj[s as GuildSettings].configurable
) as GuildSettings[];

interface GuildFeature {
	name: string;
	description: string;
	default: boolean;
}
const asGuildFeature = <T>(gf: { [K in keyof T]: GuildFeature }) => gf;

export const guildFeaturesObj = asGuildFeature({
	automod: {
		name: 'Automod',
		description: 'Deletes offensive content as well as phishing links.',
		default: false
	},
	excludeDefaultAutomod: {
		name: 'Exclude Default Automod',
		description: 'Opt out of using the default automod options.',
		default: false
	},
	excludeAutomodScamLinks: {
		name: 'Exclude Automod Scam Links',
		description: 'Opt out of having automod delete scam links.',
		default: false
	},
	delScamMentions: {
		name: 'Delete Scam Mentions',
		description: 'Deletes messages with @everyone and @here mentions that have common scam phrases.',
		default: false
	},
	autoPublish: {
		name: 'Auto Publish',
		description: 'Publishes messages in configured announcement channels.',
		default: false
	},
	// todo implement a better auto thread system
	// autoThread: {
	// 	name: 'Auto Thread',
	// 	description: 'Creates a new thread for messages in configured channels.',
	//	default: false
	// },
	blacklistedFile: {
		name: 'Blacklisted File',
		description: 'Automatically deletes malicious files.',
		default: false
	},
	boosterMessageReact: {
		name: 'Booster Message React',
		description: 'Reacts to booster messages with the boost emoji.',
		default: false
	},
	leveling: {
		name: 'Leveling',
		description: "Tracks users' messages and assigns them xp.",
		default: false
	},
	stickyRoles: {
		name: 'Sticky Roles',
		description: 'Restores past roles to a user when they rejoin.',
		default: false
	},
	reporting: {
		name: 'Reporting',
		description: 'Allow users to make reports.',
		default: false
	},
	modsCanPunishMods: {
		name: 'Mods Can Punish Mods',
		description: 'Allow moderators to punish other moderators.',
		default: false
	},
	sendLevelUpMessages: {
		name: 'Send Level Up Messages',
		description: 'Send a message when a user levels up.',
		default: true
	},
	logManualPunishments: {
		name: 'Log Manual Punishments',
		description: "Adds manual punishment to the user's modlogs and the logging channels.",
		default: true
	}
});

export const guildLogsObj = {
	automod: {
		description: 'Sends a message in this channel every time automod is activated.',
		configurable: true
	},
	moderation: {
		description: 'Sends a message in this channel every time a moderation action is performed.',
		configurable: true
	},
	report: {
		description: 'Logs user reports.',
		configurable: true
	},
	error: {
		description: 'Logs errors that occur with the bot.',
		configurable: true
	}
};

export type GuildLogType = keyof typeof guildLogsObj;
export const guildLogsArr = Object.keys(guildLogsObj).filter(
	(s) => guildLogsObj[s as GuildLogType].configurable
) as GuildLogType[];
type LogChannelDB = { [x in keyof typeof guildLogsObj]?: Snowflake };

export type GuildFeatures = keyof typeof guildFeaturesObj;
export const guildFeaturesArr: GuildFeatures[] = Object.keys(guildFeaturesObj) as GuildFeatures[];
