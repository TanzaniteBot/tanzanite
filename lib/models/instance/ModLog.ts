import type { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export enum ModLogType {
	PermBan = 'PERM_BAN',
	TempBan = 'TEMP_BAN',
	Unban = 'UNBAN',
	Kick = 'KICK',
	PermMute = 'PERM_MUTE',
	TempMute = 'TEMP_MUTE',
	Unmute = 'UNMUTE',
	Warn = 'WARN',
	PermPunishmentRole = 'PERM_PUNISHMENT_ROLE',
	TempPunishmentRole = 'TEMP_PUNISHMENT_ROLE',
	RemovePunishmentRole = 'REMOVE_PUNISHMENT_ROLE',
	PermChannelBlock = 'PERM_CHANNEL_BLOCK',
	TempChannelBlock = 'TEMP_CHANNEL_BLOCK',
	ChannelUnblock = 'CHANNEL_UNBLOCK',
	Timeout = 'TIMEOUT',
	RemoveTimeout = 'REMOVE_TIMEOUT'
}

export enum AppealStatus {
	None = 'NONE',
	Submitted = 'SUBMITTED',
	Accepted = 'ACCEPTED',
	Denied = 'DENIED'
}

export interface ModLogModel {
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
	 * The reason the user is getting punished.
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
	/**
	 * Evidence of what the user is getting punished for.
	 */
	evidence: string;
	/**
	 * Not an actual modlog just used so a punishment entry can be made.
	 */
	pseudo: boolean;
	/**
	 * Hides from the modlog command unless show hidden is specified.
	 */
	hidden: boolean;
	/**
	 * The status of an appeal for this punishment
	 */
	appeal: AppealStatus;
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
	appeal?: AppealStatus;
}

export interface ModLog extends ModLogModel {}

/**
 * A mod log case.
 */
export class ModLog extends BaseModel<ModLogModel, ModLogModelCreationAttributes> {
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
				hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
				appeal: { type: DataTypes.STRING, allowNull: false, defaultValue: AppealStatus.None }
			},
			{ sequelize }
		);
	}
}
