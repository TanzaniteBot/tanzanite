import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BushClient } from '../extensions/discord-akairo/BushClient';
import { BaseModel } from './BaseModel';
import { jsonArrayInit, NEVER_USED } from './__helpers';

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
	autoModPhases: string[];
	enabledFeatures: GuildFeatures[];
	joinRoles: Snowflake[];
	automodLogChannel: Snowflake;
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
	autoModPhases?: string[];
	enabledFeatures?: GuildFeatures[];
	joinRoles?: Snowflake[];
	automodLogChannel?: Snowflake;
}

export const guildSettings = {
	prefix: {
		name: 'Prefix',
		description: 'description goes here',
		type: 'string',
		configurable: true
	},
	autoPublishChannels: {
		name: 'Auto Publish Channels',
		description: 'description goes here',
		type: 'channel-array',
		configurable: true
	},
	welcomeChannel: {
		name: 'Welcome Channel',
		description: 'description goes here',
		type: 'channel-array',
		configurable: true
	},
	muteRole: {
		name: 'Mute Role',
		description: 'description goes here',
		type: 'role',
		configurable: true
	},
	punishmentEnding: {
		name: 'Punishment Ending',
		description: 'description goes here',
		type: 'string',
		configurable: true
	},
	lockdownChannels: {
		name: 'Lockdown Channels',
		description: 'description goes here',
		type: 'channel-array',
		configurable: false // not implemented yet
	},
	joinRoles: {
		name: 'Join Roles',
		description: 'description goes here',
		type: 'role-array',
		configurable: true
	},
	automodLogChannel: {
		name: 'Automod Log Channel',
		description: 'description goes here',
		type: 'channel',
		configurable: true
	}
};

export const guildFeaturesObj = {
	automod: {
		name: 'Automod',
		description: 'Deletes offensive content as well as phishing links.'
	},
	autoPublish: {
		name: 'Auto Publish',
		description: 'Publishes messages in configured announcement channels.'
	},
	autoThread: {
		name: 'Auto Thread',
		description: 'Creates a new thread for messages in configured channels.'
	},
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
	}
};

export type GuildFeatures = keyof typeof guildFeaturesObj;
export const guildFeaturesArr: GuildFeatures[] = Object.keys(guildFeaturesObj) as GuildFeatures[];

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
	public get autoModPhases(): string[] {
		throw new Error(NEVER_USED);
	}
	public set autoModPhases(_: string[]) {
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
	 * The channel to send automod logs to.
	 */
	public get automodLogChannel(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set automodLogChannel(_: Snowflake) {
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
				autoModPhases: jsonArrayInit('autoModPhases'),
				enabledFeatures: jsonArrayInit('enabledFeatures'),
				joinRoles: jsonArrayInit('joinRoles'),
				automodLogChannel: {
					type: DataTypes.STRING,
					allowNull: true
				}
			},
			{ sequelize: sequelize }
		);
	}
}
