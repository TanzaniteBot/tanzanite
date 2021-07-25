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
}

export class Guild extends BaseModel<GuildModel, GuildModelCreationAttributes> implements GuildModel {
	id!: Snowflake;
	prefix!: string;
	autoPublishChannels: Snowflake[];
	blacklistedChannels: Snowflake[];
	blacklistedUsers: Snowflake[];
	welcomeChannel: Snowflake;
	muteRole: Snowflake;
	punishmentEnding: string;
	disabledCommands: string[];
	lockdownChannels: Snowflake[];
	autoModPhases: string[];

	static initModel(sequelize: Sequelize, client: BushClient): void {
		Guild.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				prefix: {
					type: DataTypes.STRING,
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
				}
			},
			{ sequelize: sequelize }
		);
	}
}
