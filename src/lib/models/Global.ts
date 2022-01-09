import { type Snowflake } from 'discord.js';
import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

export interface GlobalModel {
	environment: 'production' | 'development' | 'beta';
	disabledCommands: string[];
	blacklistedUsers: Snowflake[];
	blacklistedGuilds: Snowflake[];
	blacklistedChannels: Snowflake[];
}

export interface GlobalModelCreationAttributes {
	environment: 'production' | 'development' | 'beta';
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
				disabledCommands: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedUsers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedGuilds: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
			},
			{ sequelize }
		);
	}
}
