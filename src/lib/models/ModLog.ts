import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './BaseModel';

export enum ModLogType {
	PERM_BAN = 'PERM_BAN',
	TEMP_BAN = 'TEMP_BAN',
	UNBAN = 'UNBAN',
	KICK = 'KICK',
	PERM_MUTE = 'PERM_MUTE',
	TEMP_MUTE = 'TEMP_MUTE',
	UNMUTE = 'UNMUTE',
	WARN = 'WARN',
	PERM_PUNISHMENT_ROLE = 'PERM_PUNISHMENT_ROLE',
	TEMP_PUNISHMENT_ROLE = 'TEMP_PUNISHMENT_ROLE',
	REMOVE_PUNISHMENT_ROLE = 'REMOVE_PUNISHMENT_ROLE'
}

export interface ModLogModel {
	id: string;
	type: ModLogType;
	user: Snowflake;
	moderator: Snowflake;
	reason: string;
	duration: number;
	guild: Snowflake;
}

export interface ModLogModelCreationAttributes {
	id?: string;
	type: ModLogType;
	user: Snowflake;
	moderator: Snowflake;
	reason?: string;
	duration?: number;
	guild: Snowflake;
}

export class ModLog extends BaseModel<ModLogModel, ModLogModelCreationAttributes> implements ModLogModel {
	/**
	 * The primary key of the modlog entry.
	 */
	id: string;
	/**
	 * The type of punishment.
	 */
	type: ModLogType;
	/**
	 * The user being punished.
	 */
	user: Snowflake;
	/**
	 * The user carrying out the punishment.
	 */
	moderator: Snowflake;
	/**
	 * The reason the user is getting punished
	 */
	reason: string | null;
	/**
	 * The amount of time the user is getting punished for.
	 */
	duration: number | null;
	/**
	 * The guild the user is getting punished in.
	 */
	guild: Snowflake;

	static initModel(sequelize: Sequelize): void {
		ModLog.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				type: {
					type: DataTypes.STRING, //# This is not an enum because of a sequelize issue: https://github.com/sequelize/sequelize/issues/2554
					allowNull: false
				},
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				moderator: {
					type: DataTypes.STRING,
					allowNull: false
				},
				duration: {
					type: DataTypes.STRING,
					allowNull: true
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: true
				},
				guild: {
					type: DataTypes.STRING,
					references: {
						model: 'Guilds',
						key: 'id'
					}
				}
			},
			{ sequelize: sequelize }
		);
	}
}
