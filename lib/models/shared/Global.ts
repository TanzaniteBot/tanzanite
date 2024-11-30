import type { Snowflake } from 'discord.js';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

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

/**
 * Data specific to a certain instance of the bot.
 */
export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
	/**
	 * The bot's environment.
	 */
	declare public environment: 'production' | 'development' | 'beta';

	/**
	 * Globally disabled commands.
	 */
	declare public disabledCommands: string[];

	/**
	 * Globally blacklisted users.
	 */
	declare public blacklistedUsers: Snowflake[];

	/**
	 * Guilds blacklisted from using the bot.
	 */
	declare public blacklistedGuilds: Snowflake[];

	/**
	 * Channels where the bot is prevented from running commands in.
	 */
	declare public blacklistedChannels: Snowflake[];

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
