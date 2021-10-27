import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BadWords } from '../common/AutoMod';
import { BushClient } from '../extensions/discord-akairo/BushClient';
import { BaseModel } from './BaseModel';
import { jsonArray, jsonObject } from './__helpers';

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
	autoModPhases: BadWords;
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
	autoModPhases?: BadWords;
	enabledFeatures?: GuildFeatures[];
	joinRoles?: Snowflake[];
	logChannels?: LogChannelDB;
	bypassChannelBlacklist?: Snowflake[];
	noXpChannels?: Snowflake[];
	levelRoles?: { [level: number]: Snowflake };
	levelUpChannel?: Snowflake;
}

// declaration merging so that the fields don't override Sequelize's getters
export interface Guild {
	/** The ID of the guild */
	id: Snowflake;

	/** The bot's prefix for the guild */
	prefix: string;

	/** Channels that will have their messages automatically published */
	autoPublishChannels: Snowflake[];

	/** Channels where the bot won't respond in. */
	blacklistedChannels: Snowflake[];

	/**  Users that the bot ignores in this guild */
	blacklistedUsers: Snowflake[];

	/** The channels where the welcome messages are sent */
	welcomeChannel: Snowflake;

	/** The role given out when muting someone */
	muteRole: Snowflake;

	/** The message that gets sent after someone gets a punishment dm */
	punishmentEnding: string;

	/** Guild specific disabled commands */
	disabledCommands: string[];

	/** Channels that should get locked down when the lockdown command gets used. */
	lockdownChannels: Snowflake[];

	/**  Custom automod phases */
	autoModPhases: BadWords;

	/** The features enabled in a guild */
	enabledFeatures: GuildFeatures[];

	/**  The roles to assign to a user if they are not assigned sticky roles */
	joinRoles: Snowflake[];

	/** The channels where logging messages will be sent. */
	logChannels: LogChannelDB;

	/** These users will be able to use commands in channels blacklisted */
	bypassChannelBlacklist: Snowflake[];

	/** Channels where users will not earn xp for leveling. */
	noXpChannels: Snowflake[];

	/** What roles get given to users when they reach certain levels. */
	levelRoles: { [level: number]: Snowflake };

	/** The channel to send level up messages in instead of last channel. */
	levelUpChannel: Snowflake;
}

export class Guild extends BaseModel<GuildModel, GuildModelCreationAttributes> implements GuildModel {
	public static initModel(sequelize: Sequelize, client: BushClient): void {
		Guild.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true },
				prefix: { type: DataTypes.TEXT, allowNull: false, defaultValue: client.config.prefix },
				autoPublishChannels: jsonArray('autoPublishChannels'),
				blacklistedChannels: jsonArray('blacklistedChannels'),
				blacklistedUsers: jsonArray('blacklistedChannels'),
				welcomeChannel: { type: DataTypes.STRING, allowNull: true },
				muteRole: { type: DataTypes.STRING, allowNull: true },
				punishmentEnding: { type: DataTypes.TEXT, allowNull: true },
				disabledCommands: jsonArray('disabledCommands'),
				lockdownChannels: jsonArray('lockdownChannels'),
				autoModPhases: jsonObject('autoModPhases'),
				enabledFeatures: jsonArray('enabledFeatures'),
				joinRoles: jsonArray('joinRoles'),
				logChannels: jsonObject('logChannels'),
				bypassChannelBlacklist: jsonArray('bypassChannelBlacklist'),
				noXpChannels: jsonArray('noXpChannels'),
				levelRoles: jsonObject('levelRoles'),
				levelUpChannel: { type: DataTypes.STRING, allowNull: true }
			},
			{ sequelize: sequelize }
		);
	}
}

export interface GuildSetting {
	name: string;
	description: string;
	type: 'string' | 'custom' | 'channel' | 'role' | 'user' | 'channel-array' | 'role-array' | 'user-array';
	configurable: boolean;
}
const asGuildSetting = <T>(et: { [K in keyof T]: GuildSetting }) => et;

export const guildSettingsObj = asGuildSetting({
	prefix: {
		name: 'Prefix',
		description: 'The phrase required to trigger text commands in this server.',
		type: 'string',
		configurable: true
	},
	autoPublishChannels: {
		name: 'Auto Publish Channels',
		description: 'Channels were every message is automatically published.',
		type: 'channel-array',
		configurable: true
	},
	welcomeChannel: {
		name: 'Welcome Channel',
		description: 'The channel where the bot will send join and leave message.',
		type: 'channel',
		configurable: true
	},
	muteRole: {
		name: 'Mute Role',
		description: 'The role assigned when muting someone.',
		type: 'role',
		configurable: true
	},
	punishmentEnding: {
		name: 'Punishment Ending',
		description: 'The message after punishment information to a user in a dm.',
		type: 'string',
		configurable: true
	},
	lockdownChannels: {
		name: 'Lockdown Channels',
		description: 'Channels that are locked down when a mass lockdown is specified.',
		type: 'channel-array',
		configurable: false // not implemented yet
	},
	joinRoles: {
		name: 'Join Roles',
		description: 'Roles assigned to users on join who do not have sticky role information.',
		type: 'role-array',
		configurable: true
	},
	bypassChannelBlacklist: {
		name: 'Bypass Channel Blacklist',
		description: 'These users will be able to use commands in channels blacklisted.',
		type: 'user-array',
		configurable: true
	},
	logChannels: {
		name: 'Log Channels',
		description: 'The channel were logs are sent.',
		type: 'custom',
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
		configurable: true
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
}
const asGuildFeature = <T>(gf: { [K in keyof T]: GuildFeature }) => gf;

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
	autoPublish: {
		name: 'Auto Publish',
		description: 'Publishes messages in configured announcement channels.'
	},
	// autoThread: {
	// 	name: 'Auto Thread',
	// 	description: 'Creates a new thread for messages in configured channels.'
	// },
	blacklistedFile: {
		name: 'Blacklisted File',
		description: 'Automatically deletes malicious files.'
	},
	boosterMessageReact: {
		name: 'Booster Message React',
		description: 'Reacts to booster messages with the boost emoji.'
	},
	leveling: {
		name: 'Leveling',
		description: "Tracks users' messages and assigns them xp."
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
	sendLevelUpMessages: {
		name: 'Send Level Up Messages',
		description: 'Send a message when a user levels up.'
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
