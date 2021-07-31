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
	REMOVE_PUNISHMENT_ROLE = 'REMOVE_PUNISHMENT_ROLE',
	PERM_CHANNEL_BLOCK = 'PERM_CHANNEL_BLOCK',
	TEMP_CHANNEL_BLOCK = 'TEMP_CHANNEL_BLOCK',
	CHANNEL_UNBLOCK = 'CHANNEL_UNBLOCK'
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
	public get id(): string {
		return null;
	}
	public set id(value: string) {}

	/**
	 * The type of punishment.
	 */
	public get type(): ModLogType {
		return null;
	}
	public set type(value: ModLogType) {}

	/**
	 * The user being punished.
	 */
	public get user(): Snowflake {
		return null;
	}
	public set user(value: Snowflake) {}

	/**
	 * The user carrying out the punishment.
	 */
	public get moderator(): Snowflake {
		return null;
	}
	public set moderator(value: Snowflake) {}

	/**
	 * The reason the user is getting punished
	 */
	public get reason(): string | null {
		return null;
	}
	public set reason(value: string | null) {}

	/**
	 * The amount of time the user is getting punished for.
	 */
	public get duration(): number | null {
		return null;
	}
	public set duration(value: number | null) {}

	/**
	 * The guild the user is getting punished in.
	 */
	public get guild(): Snowflake {
		return null;
	}
	public set guild(value: Snowflake) {}

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
