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
}

export const guildSettings = {
	prefix: { type: 'string' },
	autoPublishChannels: { type: 'channel-array' },
	welcomeChannel: { type: 'channel-array' },
	muteRole: { type: 'role' },
	punishmentEnding: { type: 'string' },
	lockdownChannels: { type: 'channel-array' },
	joinRoles: { type: 'role-array' }
};

export const guildFeaturesObj = {
	automod: {
		name: 'Automod',
		description: 'Deletes offensive content as well as phishing links.'
	},
	autoPublish: {
		name: 'Auto Publish',
		description: 'Auto publishes all messages in configured announcement channels.'
	},
	autoThread: {
		name: 'Auto Thread',
		description: 'Automatically creates a new thread for every message in configured channels.'
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
		description: "Stores users' roles when they leave the server and returns them when they rejoin."
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
				joinRoles: jsonArrayInit('joinRoles')
			},
			{ sequelize: sequelize }
		);
	}
}
