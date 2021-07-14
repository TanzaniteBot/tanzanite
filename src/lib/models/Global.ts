import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface GlobalModel {
	environment: 'production' | 'development';
	superUsers: Snowflake[];
	disabledCommands: string[];
	blacklistedUsers: Snowflake[];
	blacklistedGuilds: Snowflake[];
	blacklistedChannels: Snowflake[];
}

export interface GlobalModelCreationAttributes {
	environment: 'production' | 'development';
	superUsers?: Snowflake[];
	disabledCommands?: string[];
	blacklistedUsers?: Snowflake[];
	blacklistedGuilds?: Snowflake[];
	blacklistedChannels?: Snowflake[];
}

export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
	/**
	 * The bot's environment.
	 */
	environment: 'production' | 'development';
	/**
	 * Trusted users.
	 */
	superUsers: Snowflake[];
	/**
	 * Globally disabled commands.
	 */
	disabledCommands: string[];
	/**
	 * Globally blacklisted users.
	 */
	blacklistedUsers: Snowflake[];
	/**
	 * Guilds blacklisted from using the bot.
	 */
	blacklistedGuilds: Snowflake[];
	/**
	 * Channels where the bot is prevented from running.
	 */
	blacklistedChannels: Snowflake[];
	static initModel(sequelize: Sequelize): void {
		Global.init(
			{
				environment: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				superUsers: {
					type: DataTypes.STRING,
					get: function () {
						return JSON.parse(this.getDataValue('superUsers') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('superUsers', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: true
				},
				disabledCommands: {
					type: DataTypes.STRING,
					get: function () {
						return JSON.parse(this.getDataValue('disabledCommands') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('disabledCommands', JSON.stringify(val) as unknown as string[]);
					},
					allowNull: true
				},
				blacklistedUsers: {
					type: DataTypes.STRING,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedUsers') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedUsers', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: true
				},
				blacklistedGuilds: {
					type: DataTypes.STRING,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedGuilds') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedGuilds', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: true
				},
				blacklistedChannels: {
					type: DataTypes.STRING,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedChannels') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedChannels', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: true
				}
			},
			{ sequelize: sequelize }
		);
	}
}
