import { type Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

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
	CHANNEL_UNBLOCK = 'CHANNEL_UNBLOCK',
	TIMEOUT = 'TIMEOUT',
	REMOVE_TIMEOUT = 'REMOVE_TIMEOUT'
}

export interface ModLogModel {
	id: string;
	type: ModLogType;
	user: Snowflake;
	moderator: Snowflake;
	reason: string | null;
	duration: number | null;
	guild: Snowflake;
	evidence: string;
	pseudo: boolean;
	hidden: boolean;
}

export interface ModLogModelCreationAttributes {
	id?: string;
	type: ModLogType;
	user: Snowflake;
	moderator: Snowflake;
	reason?: string | null;
	duration?: number;
	guild: Snowflake;
	evidence?: string;
	pseudo?: boolean;
	hidden?: boolean;
}

export class ModLog extends BaseModel<ModLogModel, ModLogModelCreationAttributes> implements ModLogModel {
	/**
	 * The primary key of the modlog entry.
	 */
	public declare id: string;

	/**
	 * The type of punishment.
	 */
	public declare type: ModLogType;

	/**
	 * The user being punished.
	 */
	public declare user: Snowflake;

	/**
	 * The user carrying out the punishment.
	 */
	public declare moderator: Snowflake;

	/**
	 * The reason the user is getting punished.
	 */
	public declare reason: string | null;

	/**
	 * The amount of time the user is getting punished for.
	 */
	public declare duration: number | null;

	/**
	 * The guild the user is getting punished in.
	 */
	public declare guild: Snowflake;

	/**
	 * Evidence of what the user is getting punished for.
	 */
	public declare evidence: string;

	/**
	 * Not an actual modlog just used so a punishment entry can be made.
	 */
	public declare pseudo: boolean;

	/**
	 * Hides from the modlog command unless show hidden is specified.
	 */
	public declare hidden: boolean;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		ModLog.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: nanoid },
				type: { type: DataTypes.STRING, allowNull: false }, //? This is not an enum because of a sequelize issue: https://github.com/sequelize/sequelize/issues/2554
				user: { type: DataTypes.STRING, allowNull: false },
				moderator: { type: DataTypes.STRING, allowNull: false },
				duration: { type: DataTypes.STRING, allowNull: true },
				reason: { type: DataTypes.TEXT, allowNull: true },
				guild: { type: DataTypes.STRING, references: { model: 'Guilds', key: 'id' } },
				evidence: { type: DataTypes.TEXT, allowNull: true },
				pseudo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
			},
			{ sequelize }
		);
	}
}
