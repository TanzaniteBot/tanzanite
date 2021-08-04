import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface GlobalModel {
	environment: 'production' | 'development' | 'beta';
	superUsers: Snowflake[];
	disabledCommands: string[];
	blacklistedUsers: Snowflake[];
	blacklistedGuilds: Snowflake[];
	blacklistedChannels: Snowflake[];
}

export interface GlobalModelCreationAttributes {
	environment: 'production' | 'development' | 'beta';
	superUsers?: Snowflake[];
	disabledCommands?: string[];
	blacklistedUsers?: Snowflake[];
	blacklistedGuilds?: Snowflake[];
	blacklistedChannels?: Snowflake[];
}

const NEVER_USED = 'This should never be executed';

export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
	/**
	 * The bot's environment.
	 */
	public get environment(): 'production' | 'development' | 'beta' {
		throw new Error(NEVER_USED);
	}
	public set environment(_: 'production' | 'development' | 'beta') {
		throw new Error(NEVER_USED);
	}

	/**
	 * Trusted users.
	 */
	public get superUsers(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set superUsers(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Globally disabled commands.
	 */
	public get disabledCommands(): string[] {
		throw new Error(NEVER_USED);
	}
	public set disabledCommands(_: string[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Globally blacklisted users.
	 */
	public get blacklistedUsers(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set blacklistedUsers(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Guilds blacklisted from using the bot.
	 */
	public get blacklistedGuilds(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set blacklistedGuilds(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Channels where the bot is prevented from running.
	 */
	public get blacklistedChannels(): Snowflake[] {
		throw new Error(NEVER_USED);
	}
	public set blacklistedChannels(_: Snowflake[]) {
		throw new Error(NEVER_USED);
	}

	public static initModel(sequelize: Sequelize): void {
		Global.init(
			{
				environment: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				superUsers: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('superUsers') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('superUsers', JSON.stringify(val) as unknown as Snowflake[]);
					},
					allowNull: false,
					defaultValue: '[]'
				},
				disabledCommands: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('disabledCommands') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('disabledCommands', JSON.stringify(val) as unknown as string[]);
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
				blacklistedGuilds: {
					type: DataTypes.TEXT,
					get: function () {
						return JSON.parse(this.getDataValue('blacklistedGuilds') as unknown as string);
					},
					set: function (val: Snowflake[]) {
						return this.setDataValue('blacklistedGuilds', JSON.stringify(val) as unknown as Snowflake[]);
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
				}
			},
			{ sequelize: sequelize }
		);
	}
}
