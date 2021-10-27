import { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { jsonBoolean } from './__helpers';

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

// declaration merging so that the fields don't override Sequelize's getters
export interface ModLog {
	/** The primary key of the modlog entry. */
	id: string;

	/** The type of punishment. */
	type: ModLogType;

	/** The user being punished. */
	user: Snowflake;

	/** The user carrying out the punishment. */
	moderator: Snowflake;

	/** The reason the user is getting punished. */
	reason: string | null;

	/** The amount of time the user is getting punished for. */
	duration: number | null;

	/** The guild the user is getting punished in. */
	guild: Snowflake;

	/** Evidence of what the user is getting punished for. */
	evidence: string;

	/** Not an actual modlog just used so a punishment entry can be made. */
	pseudo: boolean;

	/** Hides from the modlog command unless show hidden is specified. */
	hidden: boolean;
}

export class ModLog extends BaseModel<ModLogModel, ModLogModelCreationAttributes> implements ModLogModel {
	public static initModel(sequelize: Sequelize): void {
		ModLog.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: nanoid },
				type: { type: DataTypes.STRING, allowNull: false }, //# This is not an enum because of a sequelize issue: https://github.com/sequelize/sequelize/issues/2554
				user: { type: DataTypes.STRING, allowNull: false },
				moderator: { type: DataTypes.STRING, allowNull: false },
				duration: { type: DataTypes.STRING, allowNull: true },
				reason: { type: DataTypes.TEXT, allowNull: true },
				guild: { type: DataTypes.STRING, references: { model: 'Guilds', key: 'id' } },
				evidence: { type: DataTypes.TEXT, allowNull: true },
				pseudo: jsonBoolean('pseudo'),
				hidden: jsonBoolean('hidden')
			},
			{ sequelize }
		);
	}
}
