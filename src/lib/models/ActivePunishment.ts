import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './BaseModel';

export enum ActivePunishmentType {
	BAN = 'BAN',
	MUTE = 'MUTE',
	ROLE = 'ROLE',
	BLOCK = 'BLOCK'
}

export interface ActivePunishmentModel {
	id: string;
	type: ActivePunishmentType;
	user: Snowflake;
	guild: Snowflake;
	extraInfo: Snowflake;
	expires: Date;
	modlog: string;
}
export interface ActivePunishmentModelCreationAttributes {
	id?: string;
	type: ActivePunishmentType;
	user: Snowflake;
	guild: Snowflake;
	extraInfo?: Snowflake;
	expires?: Date;
	modlog: string;
}

export class ActivePunishment
	extends BaseModel<ActivePunishmentModel, ActivePunishmentModelCreationAttributes>
	implements ActivePunishmentModel
{
	/**
	 * The ID of this punishment (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The type of punishment.
	 */
	type: ActivePunishmentType;
	/**
	 * The user who is punished.
	 */
	user: Snowflake;
	/**
	 * The guild they are punished in.
	 */
	guild: Snowflake;
	/**
	 * Additional info about the punishment if applicable. The channel id for channel blocks and role for punishment roles.
	 */
	extraInfo: Snowflake;
	/**
	 * The date when this punishment expires (optional).
	 */
	expires: Date | null;
	/**
	 * The reference to the modlog entry.
	 */
	modlog: string;

	static initModel(sequelize: Sequelize): void {
		ActivePunishment.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				type: {
					type: DataTypes.STRING,
					allowNull: false
				},
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				guild: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						model: 'Guilds',
						key: 'id'
					}
				},
				extraInfo: {
					type: DataTypes.DATE,
					allowNull: true
				},
				expires: {
					type: DataTypes.DATE,
					allowNull: true
				},
				modlog: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						model: 'ModLogs',
						key: 'id'
					}
				}
			},
			{ sequelize: sequelize }
		);
	}
}
