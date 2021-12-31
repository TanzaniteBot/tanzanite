import { type Snowflake } from 'discord.js';
import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
import { jsonArray } from './__helpers.js';

const { DataTypes } = (await import('sequelize')).default;

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

export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
	/**
	 * The bot's environment.
	 */
	public declare environment: 'production' | 'development' | 'beta';

	/**
	 * Trusted users.
	 */
	public declare superUsers: Snowflake[];

	/**
	 * Globally disabled commands.
	 */
	public declare disabledCommands: string[];

	/**
	 * Globally blacklisted users.
	 */
	public declare blacklistedUsers: Snowflake[];

	/**
	 * Guilds blacklisted from using the bot.
	 */
	public declare blacklistedGuilds: Snowflake[];

	/**
	 * Channels where the bot is prevented from running commands in.
	 */
	public declare blacklistedChannels: Snowflake[];

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Global.init(
			{
				environment: { type: DataTypes.STRING, primaryKey: true },
				superUsers: jsonArray('superUsers'),
				disabledCommands: jsonArray('disabledCommands'),
				blacklistedUsers: jsonArray('blacklistedUsers'),
				blacklistedGuilds: jsonArray('blacklistedGuilds'),
				blacklistedChannels: jsonArray('blacklistedChannels')
			},
			{ sequelize }
		);
	}
}
