import type { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export enum ActivePunishmentType {
	Ban = 'BAN',
	Mute = 'MUTE',
	Role = 'ROLE',
	Block = 'BLOCK'
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
	modlog: string;
}

/**
 * Keeps track of active punishments so they can be removed later.
 */
export class ActivePunishment
	extends BaseModel<ActivePunishmentModel, ActivePunishmentModelCreationAttributes>
	implements ActivePunishmentModel
{
	/**
	 * The ID of this punishment (no real use just for a primary key)
	 */
	declare public id: string;

	/**
	 * The type of punishment.
	 */
	declare public type: ActivePunishmentType;

	/**
	 * The user who is punished.
	 */
	declare public user: Snowflake;

	/**
	 * The guild they are punished in.
	 */
	declare public guild: Snowflake;

	/**
	 * Additional info about the punishment if applicable. The channel id for channel blocks and role for punishment roles.
	 */
	declare public extraInfo: Snowflake;

	/**
	 * The date when this punishment expires (optional).
	 */
	declare public expires: Date | null;

	/**
	 * The reference to the modlog entry.
	 */
	declare public modlog: string;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		ActivePunishment.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true, defaultValue: nanoid },
				type: { type: DataTypes.STRING, allowNull: false },
				user: { type: DataTypes.STRING, allowNull: false },
				guild: { type: DataTypes.STRING, allowNull: false, references: { model: 'Guilds', key: 'id' } },
				extraInfo: { type: DataTypes.STRING, allowNull: true },
				expires: { type: DataTypes.DATE, allowNull: true },
				modlog: { type: DataTypes.STRING, allowNull: true, references: { model: 'ModLogs', key: 'id' } }
			},
			{ sequelize }
		);
	}
}
