import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { jsonArrayInit, NEVER_USED } from './__helpers';

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
				superUsers: jsonArrayInit('superUsers'),
				disabledCommands: jsonArrayInit('disabledCommands'),
				blacklistedUsers: jsonArrayInit('blacklistedUsers'),
				blacklistedGuilds: jsonArrayInit('blacklistedGuilds'),
				blacklistedChannels: jsonArrayInit('blacklistedChannels')
			},
			{ sequelize }
		);
	}
}
