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
	expires: Date | null;
	modlog: string;
}
export interface ActivePunishmentModelCreationAttributes {
	id?: string;
	type: ActivePunishmentType;
	user: Snowflake;
	guild: Snowflake;
	extraInfo?: Snowflake;
	expires?: Date;
	modlog?: string;
}

const NEVER_USED = 'This should never be executed';

export class ActivePunishment
	extends BaseModel<ActivePunishmentModel, ActivePunishmentModelCreationAttributes>
	implements ActivePunishmentModel
{
	/**
	 * The ID of this punishment (no real use just for a primary key)
	 */
	public get id(): string {
		throw new Error(NEVER_USED);
	}
	public set id(_: string) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The type of punishment.
	 */
	public get type(): ActivePunishmentType {
		throw new Error(NEVER_USED);
	}
	public set type(_: ActivePunishmentType) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The user who is punished.
	 */
	public get user(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set user(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The guild they are punished in.
	 */
	public get guild(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set guild(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * Additional info about the punishment if applicable. The channel id for channel blocks and role for punishment roles.
	 */
	public get extraInfo(): Snowflake {
		throw new Error(NEVER_USED);
	}
	public set extraInfo(_: Snowflake) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The date when this punishment expires (optional).
	 */
	public get expires(): Date | null {
		throw new Error(NEVER_USED);
	}
	public set expires(_: Date | null) {
		throw new Error(NEVER_USED);
	}

	/**
	 * The reference to the modlog entry.
	 */
	public get modlog(): string {
		throw new Error(NEVER_USED);
	}
	public set modlog(_: string) {
		throw new Error(NEVER_USED);
	}

	public static initModel(sequelize: Sequelize): void {
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
					allowNull: true,
					references: {
						model: 'ModLogs',
						key: 'id'
					}
				}
			},
			{ sequelize }
		);
	}
}
