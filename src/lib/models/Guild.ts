import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BushClient } from '../extensions/discord-akairo/BushClient';
import { BaseModel } from './BaseModel';

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
	enabledFeatures: string[];
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
	enabledFeatures?: string[];
}

export const guildSettings = {
	prefix: { type: 'string' },
	autoPublishChannels: { type: 'channel-array' },
	welcomeChannel: { type: 'channel-array' },
	muteRole: { type: 'role' },
	punishmentEnding: { type: 'string' },
	lockdownChannels: { type: 'channel-array' }
};

export const guildFeatures = ['automodEnabled', 'supportThreads', 'stickyRoles'];

const NEVER_USED = 'This should never be executed';

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
	public get enabledFeatures(): string[] {
		throw new Error(NEVER_USED);
	}
	public set enabledFeatures(_: string[]) {
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
				autoPublishChannels: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('autoPublishChannels') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('autoPublishChannels', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				blacklistedChannels: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedChannels') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedChannels', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				blacklistedUsers: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedUsers') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedUsers', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
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
				disabledCommands: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('disabledCommands') as unknown as string);
					},
					set: function (val: string[]) {
						return this.setDataValue('disabledCommands', JSON.stringify(val) as unknown as string[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				lockdownChannels: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('lockdownChannels') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('lockdownChannels', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				autoModPhases: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('autoModPhases') as unknown as string);
					},
					set: function (val: string[]) {
						return this.setDataValue('autoModPhases', JSON.stringify(val) as unknown as string[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				enabledFeatures: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('enabledFeatures') as unknown as string);
					},
					set: function (val: string[]) {
						return this.setDataValue('enabledFeatures', JSON.stringify(val) as unknown as string[]);
					},
					allowNull: false,
					defaultValue: '[]'
				}
			},
			{ sequelize: sequelize }
		);
	}
}
