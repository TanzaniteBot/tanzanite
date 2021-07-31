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
	public get id(): string {
		return null;
	}
	public set id(value: string) {}

	/**
	 * The type of punishment.
	 */
	public get type(): ActivePunishmentType {
		return null;
	}
	public set type(value: ActivePunishmentType) {}

	/**
	 * The user who is punished.
	 */
	public get user(): Snowflake {
		return null;
	}
	public set user(value: Snowflake) {}

	/**
	 * The guild they are punished in.
	 */
	public get guild(): Snowflake {
		return null;
	}
	public set guild(value: Snowflake) {}

	/**
	 * Additional info about the punishment if applicable. The channel id for channel blocks and role for punishment roles.
	 */
	public get extraInfo(): Snowflake {
		return null;
	}
	public set extraInfo(value: Snowflake) {}

	/**
	 * The date when this punishment expires (optional).
	 */
	public get expires(): Date | null {
		return null;
	}
	public set expires(value: Date | null) {}

	/**
	 * The reference to the modlog entry.
	 */
	public get modlog(): string {
		return null;
	}
	public set modlog(value: string) {}

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
