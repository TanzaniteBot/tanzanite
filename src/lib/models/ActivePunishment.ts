import { type Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
const { DataTypes } = (await import('sequelize')).default 

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
	modlog: string;
}

export class ActivePunishment
	extends BaseModel<ActivePunishmentModel, ActivePunishmentModelCreationAttributes>
	implements ActivePunishmentModel
{
	/** 
	 * The ID of this punishment (no real use just for a primary key) 
	 */
	public declare id: string;

	/** 
	 * The type of punishment.
	 */
	public declare type: ActivePunishmentType;

	/** 
	 * The user who is punished. 
	 */
	public declare user: Snowflake;

	/** 
	 * The guild they are punished in. 
	 */
	public declare guild: Snowflake;

	/** 
	 * Additional info about the punishment if applicable. The channel id for channel blocks and role for punishment roles. 
	 */
	public declare extraInfo: Snowflake;

	/** 
	 * The date when this punishment expires (optional). 
	 */
	public declare expires: Date | null;

	/** 
	 * The reference to the modlog entry. 
	 */
	public declare modlog: string;

	public static initModel(sequelize: Sequelize): void {
		ActivePunishment.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: nanoid },
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
