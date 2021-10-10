import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BushClient } from '../extensions/discord-akairo/BushClient';
import { BaseModel } from './BaseModel';
import { jsonArrayInit, jsonParseGet, jsonParseSet, NEVER_USED } from './__helpers';

interface GuildSetting {
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
	}
};
export type GuildLogType = keyof typeof guildLogsObj;
export const guildLogsArr = Object.keys(guildLogsObj).filter(
	(s) => guildLogsObj[s as GuildLogType].configurable
) as GuildLogType[];
type LogChannelDB = { [x in keyof typeof guildLogsObj]?: Snowflake };

export type GuildFeatures = keyof typeof guildFeaturesObj;
export const guildFeaturesArr: GuildFeatures[] = Object.keys(guildFeaturesObj) as GuildFeatures[];

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
	autoModPhases: { [word: string]: 0 | 1 | 2 | 3 };
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
	autoModPhases?: { [word: string]: 0 | 1 | 2 | 3 };
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
	public get id(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set id(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The bot's prefix for the guild
	 */
	public get prefix(): string {
		throw new Error(NEVER_USED);
	}
	public set prefix(_: string) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Channels that will have their messages automatically published
	 */
	public get autoPublishChannels(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set autoPublishChannels(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Channels where the bot won't respond in.
	 */
	public get blacklistedChannels(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set blacklistedChannels(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Users that the bot ignores in this guild
	 */
	public get blacklistedUsers(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set blacklistedUsers(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The channels where the welcome messages are sent
	 */
	public get welcomeChannel(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set welcomeChannel(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The role given out when muting someone
	 */
	public get muteRole(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set muteRole(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The message that gets sent after someone gets a punishment dm
	 */
	public get punishmentEnding(): string {
		throw new Error(NEVER_USED);
	}
	public set punishmentEnding(_: string) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Guild specific disabled commands
	 */
	public get disabledCommands(): string[] {
		throw new Error(NEVER_USED);
	}
	public set disabledCommands(_: string[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Channels that should get locked down when the lockdown command gets used.
	 */
	public get lockdownChannels(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set lockdownChannels(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Custom automod phases
	 */
	public get autoModPhases(): { [word: string]: 0 | 1 | 2 | 3 } {
		throw new Error(NEVER_USED);
	}
	public set autoModPhases(_: { [word: string]: 0 | 1 | 2 | 3 }) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The features enabled in a guild
	 */
	public get enabledFeatures(): GuildFeatures[] {
		throw new Error(NEVER_USED);
	}
	public set enabledFeatures(_: GuildFeatures[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The roles to assign to a user if they are not assigned sticky roles
	 */
	public get joinRoles(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set joinRoles(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The channels where logging messages will be sent.
	 */
	public get logChannels(): LogChannelDB {
		throw new Error(NEVER_USED);
	}
	public set logChannels(_: LogChannelDB) {
		throw new Error(NEVER_USED);
	}

	/**
	 * These users will be able to use commands in channels blacklisted
	 */
	public get bypassChannelBlacklist(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set bypassChannelBlacklist(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Channels where users will not earn xp for leveling.
	 */
	public get noXpChannels(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set noXpChannels(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * What roles get given to users when they reach certain levels.
	 */
	public get levelRoles(): { [level: number]: Snowflake } {
		throw new Error(NEVER_USED);
	}
	public set levelRoles(_: { [level: number]: Snowflake }) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The channel to send level up messages in instead of last channel.
	 */
	public get levelUpChannel(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set levelUpChannel(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	public static initModel(sequelize: Sequelize, client: BushClient): void {
		Guild.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				prefix: {
					type: DataTypes.TEXT,
					allowNull: false,
					defaultValue: client.config.prefix
				},
				autoPublishChannels: jsonArrayInit('autoPublishChannels'),
				blacklistedChannels: jsonArrayInit('blacklistedChannels'),
				blacklistedUsers: jsonArrayInit('blacklistedChannels'),
				welcomeChannel: {
					type: DataTypes.STRING,
					allowNull: true
				},
				muteRole: {
					type: DataTypes.STRING,
					allowNull: true
				},
				punishmentEnding: {
					type: DataTypes.TEXT,
					allowNull: true
				},
				disabledCommands: jsonArrayInit('disabledCommands'),
				lockdownChannels: jsonArrayInit('lockdownChannels'),
				autoModPhases: {
					type: DataTypes.TEXT,
					get: function (): { [level: number]: Snowflake } {
						return jsonParseGet.call(this, 'autoModPhases');
					},
					set: function (val: { [level: number]: Snowflake }) {
						return jsonParseSet.call(this, 'autoModPhases', val);
					},
					allowNull: false,
					defaultValue: '{}'
				},
				enabledFeatures: jsonArrayInit('enabledFeatures'),
				joinRoles: jsonArrayInit('joinRoles'),
				logChannels: {
					type: DataTypes.TEXT,
					get: function (): LogChannelDB {
						return jsonParseGet.call(this, 'logChannels');
					},
					set: function (val: LogChannelDB) {
						return jsonParseSet.call(this, 'logChannels', val);
					},
					allowNull: false,
					defaultValue: '{}'
				},
				bypassChannelBlacklist: jsonArrayInit('bypassChannelBlacklist'),
				noXpChannels: jsonArrayInit('noXpChannels'),
				levelRoles: {
					type: DataTypes.TEXT,
					get: function (): { [level: number]: Snowflake } {
						return jsonParseGet.call(this, 'levelRoles');
					},
					set: function (val: { [level: number]: Snowflake }) {
						return jsonParseSet.call(this, 'levelRoles', val);
					},
					allowNull: false,
					defaultValue: '{}'
				},
				levelUpChannel: {
					type: DataTypes.STRING,
					allowNull: true
				}
			},
			{ sequelize: sequelize }
		);
	}
}
