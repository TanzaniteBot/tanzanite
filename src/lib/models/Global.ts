import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { jsonArray } from './__helpers';

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

// declaration merging so that the fields don't override Sequelize's getters
export interface Global {
	/** The bot's environment. */
	environment: 'production' | 'development' | 'beta';

	/** Trusted users. */
	superUsers: Snowflake[];

	/** Globally disabled commands. */
	disabledCommands: string[];

	/** Globally blacklisted users. */
	blacklistedUsers: Snowflake[];

	/** Guilds blacklisted from using the bot. */
	blacklistedGuilds: Snowflake[];

	/** Channels where the bot is prevented from running. */
	blacklistedChannels: Snowflake[];
}

export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
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
