import config from '#config';
import type { BadWordDetails } from '#lib/automod/AutomodShared.js';
import type { TanzaniteClient } from '#lib/extensions/discord-akairo/TanzaniteClient.js';
import { ChannelType, Constants, type Snowflake } from 'discord.js';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export interface GuildModel {
	id: Snowflake;
	prefix: string;
	autoPublishChannels: Snowflake[];
	blacklistedChannels: Snowflake[];
	blacklistedUsers: Snowflake[];
	welcomeChannel: Snowflake | null;
	muteRole: Snowflake | null;
	punishmentEnding: string | null;
	disabledCommands: string[];
	lockdownChannels: Snowflake[];
	autoModPhases: BadWordDetails[];
	enabledFeatures: GuildFeatures[];
	joinRoles: Snowflake[];
	logChannels: LogChannelDB;
	bypassChannelBlacklist: Snowflake[];
	noXpChannels: Snowflake[];
	levelRoles: { [level: number]: Snowflake };
	levelUpChannel: Snowflake | null;
	ticketThreadAddRoles: Snowflake[];
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
	ticketThreadAddRoles?: Snowflake[];
}

/**
 * Settings for a guild.
 */
export class Guild extends BaseModel<GuildModel, GuildModelCreationAttributes> implements GuildModel {
	/**
	 * The ID of the guild
	 */
	declare public id: Snowflake;

	/**
	 * The bot's prefix for the guild
	 */
	declare public prefix: string;

	/**
	 * Channels that will have their messages automatically published
	 */
	declare public autoPublishChannels: Snowflake[];

	/**
	 * Channels where the bot won't respond in.
	 */
	declare public blacklistedChannels: Snowflake[];

	/**
	 * Users that the bot ignores in this guild
	 */
	declare public blacklistedUsers: Snowflake[];

	/**
	 * The channels where the welcome messages are sent
	 */
	declare public welcomeChannel: Snowflake | null;

	/**
	 * The role given out when muting someone
	 */
	declare public muteRole: Snowflake | null;

	/**
	 * The message that gets sent after someone gets a punishment dm
	 */
	declare public punishmentEnding: string | null;

	/**
	 * Guild specific disabled commands
	 */
	declare public disabledCommands: string[];

	/**
	 * Channels that should get locked down when the lockdown command gets used.
	 */
	declare public lockdownChannels: Snowflake[];

	/**
	 * Custom automod phases
	 */
	declare public autoModPhases: BadWordDetails[];

	/**
	 * The features enabled in a guild
	 */
	declare public enabledFeatures: GuildFeatures[];

	/**
	 * The roles to assign to a user if they are not assigned sticky roles
	 */
	declare public joinRoles: Snowflake[];

	/**
	 * The channels where logging messages will be sent.
	 */
	declare public logChannels: LogChannelDB;

	/**
	 * These users will be able to use commands in channels blacklisted
	 */
	declare public bypassChannelBlacklist: Snowflake[];

	/**
	 * Channels where users will not earn xp for leveling.
	 */
	declare public noXpChannels: Snowflake[];

	/**
	 * What roles get given to users when they reach certain levels.
	 */
	declare public levelRoles: { [level: number]: Snowflake };

	/**
	 * The channel to send level up messages in instead of last channel.
	 */
	declare public levelUpChannel: Snowflake | null;

	/**
	 * The roles that get added to button-thread tickets.
	 */
	declare public ticketThreadAddRoles: Snowflake[];

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize, client: TanzaniteClient): void {
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
				levelUpChannel: { type: DataTypes.STRING, allowNull: true },
				ticketThreadAddRoles: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
			},
			{ sequelize }
		);
	}
}

export type BaseGuildSetting = 'channel' | 'role' | 'user';
export type GuildNoArraySetting = 'string' | 'custom' | BaseGuildSetting;
export type GuildSettingType = GuildNoArraySetting | `${BaseGuildSetting}-array`;

export interface GuildSetting {
	name: string;
	description: string;
	type: GuildSettingType;
	subType: ChannelType[] | undefined;
	configurable: boolean;
	replaceNullWith: () => string | null;
}
const asGuildSetting = <T>(et: { [K in keyof T]: PartialBy<GuildSetting, 'configurable' | 'subType' | 'replaceNullWith'> }) => {
	for (const key in et) {
		et[key].subType ??= undefined;
		et[key].configurable ??= true;
		et[key].replaceNullWith ??= () => null;
	}
	return et as { [K in keyof T]: GuildSetting };
};

export const guildSettingsObj = asGuildSetting({
	prefix: {
		name: 'Prefix',
		description: 'The phrase required to trigger text commands in this server.',
		type: 'string',
		replaceNullWith: () => config.prefix
	},
	autoPublishChannels: {
		name: 'Auto Publish Channels',
		description: 'Channels were every message is automatically published.',
		type: 'channel-array',
		subType: [ChannelType.GuildAnnouncement]
	},
	welcomeChannel: {
		name: 'Welcome Channel',
		description: 'The channel where the bot will send join and leave message.',
		type: 'channel',
		subType: [
			ChannelType.GuildText,
			ChannelType.GuildAnnouncement,
			ChannelType.AnnouncementThread,
			ChannelType.PublicThread,
			ChannelType.PrivateThread
		]
	},
	muteRole: {
		name: 'Mute Role',
		description: 'The role assigned when muting someone.',
		type: 'role'
	},
	punishmentEnding: {
		name: 'Punishment Ending',
		description: 'The message after punishment information to a user in a dm.',
		type: 'string'
	},
	lockdownChannels: {
		name: 'Lockdown Channels',
		description: 'Channels that are locked down when a mass lockdown is specified.',
		type: 'channel-array',
		subType: [ChannelType.GuildText]
	},
	joinRoles: {
		name: 'Join Roles',
		description: 'Roles assigned to users on join who do not have sticky role information.',
		type: 'role-array'
	},
	bypassChannelBlacklist: {
		name: 'Bypass Channel Blacklist',
		description: 'These users will be able to use commands in channels blacklisted.',
		type: 'user-array'
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
		configurable: false
	},
	noXpChannels: {
		name: 'No Xp Channels',
		description: 'Channels where users will not earn xp for leveling.',
		type: 'channel-array',
		subType: Constants.TextBasedChannelTypes.filter((type) => type !== ChannelType.DM)
	},
	levelRoles: {
		name: 'Level Roles',
		description: 'What roles get given to users when they reach certain levels.',
		type: 'custom',
		configurable: false
	},
	levelUpChannel: {
		name: 'Level Up Channel',
		description: 'The channel to send level up messages in instead of last channel.',
		type: 'channel',
		subType: Constants.TextBasedChannelTypes.filter((type) => type !== ChannelType.DM)
	},
	ticketThreadAddRoles: {
		name: 'Ticket Thread Add Roles',
		description: 'Roles whose members get added to ticket threads.',
		type: 'role-array',
		configurable: false
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
	hidden: boolean;
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

const asGuildFeature = <T>(gf: { [K in keyof T]: PartialBy<GuildFeature, 'hidden' | 'default'> }): {
	[K in keyof T]: GuildFeature;
} => {
	for (const key in gf) {
		gf[key].hidden ??= false;
		gf[key].default ??= false;
	}
	return gf as { [K in keyof T]: GuildFeature };
};

export const guildFeaturesObj = asGuildFeature({
	automod: {
		name: 'Automod',
		description: 'Deletes offensive content as well as phishing links.'
	},
	excludeDefaultAutomod: {
		name: 'Exclude Default Automod',
		description: 'Opt out of using the default automod options.'
	},
	excludeAutomodScamLinks: {
		name: 'Exclude Automod Scam Links',
		description: 'Opt out of having automod delete scam links.'
	},
	delScamMentions: {
		name: 'Delete Scam Mentions',
		description: 'Deletes messages with @everyone and @here mentions that have common scam phrases.'
	},
	automodPresence: {
		name: 'Automod Presence',
		description: 'Logs presence changes that trigger automod.',
		hidden: true
	},
	automodMembers: {
		name: 'Automod Members',
		description: "Logs members' usernames and nicknames changes if they match automod."
	},
	blacklistedFile: {
		name: 'Blacklisted File',
		description: 'Automatically deletes malicious files.'
	},
	autoPublish: {
		name: 'Auto Publish',
		description: 'Publishes messages in configured announcement channels.'
	},
	// todo implement a better auto thread system
	autoThread: {
		name: 'Auto Thread',
		description: 'Creates a new thread for messages in configured channels.',
		hidden: true
	},
	perspectiveApi: {
		name: 'Perspective API',
		description: 'Use the Perspective API to detect toxicity.',
		hidden: true
	},
	boosterMessageReact: {
		name: 'Booster Message React',
		description: 'Reacts to booster messages with the boost emoji.'
	},
	leveling: {
		name: 'Leveling',
		description: "Tracks users' messages and assigns them xp."
	},
	sendLevelUpMessages: {
		name: 'Send Level Up Messages',
		description: 'Send a message when a user levels up.',
		default: true
	},
	stickyRoles: {
		name: 'Sticky Roles',
		description: 'Restores past roles to a user when they rejoin.'
	},
	reporting: {
		name: 'Reporting',
		description: 'Allow users to make reports.'
	},
	modsCanPunishMods: {
		name: 'Mods Can Punish Mods',
		description: 'Allow moderators to punish other moderators.'
	},
	logManualPunishments: {
		name: 'Log Manual Punishments',
		description: "Adds manual punishment to the user's modlogs and the logging channels.",
		default: true
	},
	punishmentAppeals: {
		name: 'Punishment Appeals',
		description: 'Allow users to appeal their punishments and send the appeal to the configured channel.',
		hidden: true
	},
	highlight: {
		name: 'Highlight',
		description: 'Allows the highlight command to be used.',
		default: true
	},
	quoting: {
		name: 'Quoting',
		description: 'Allows the bot to quote messages.',
		hidden: true
	},
	specifyBanInWelcome: {
		name: 'Specify Ban In Welcome',
		description: 'Specify if a user was banned in the welcome channel for member leave messages.',
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
	},
	appeals: {
		description: 'Where punishment appeals are sent.',
		configurable: false
	}
};

export type GuildLogType = keyof typeof guildLogsObj;
export const guildLogsArr = Object.keys(guildLogsObj).filter(
	(s) => guildLogsObj[s as GuildLogType].configurable
) as GuildLogType[];
type LogChannelDB = { [x in keyof typeof guildLogsObj]?: Snowflake };

export type GuildFeatures = keyof typeof guildFeaturesObj;
export const guildFeaturesArr: GuildFeatures[] = Object.keys(guildFeaturesObj) as GuildFeatures[];
