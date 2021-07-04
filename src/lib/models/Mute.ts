import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from '..';

export interface MuteModel {
	id: string;
	user: string;
	guild: string;
	expires: Date;
	modlog: string;
}
export interface MuteModelCreationAttributes {
	id?: string;
	user: string;
	guild: string;
	expires?: Date;
	modlog: string;
}

export class Mute extends BaseModel<MuteModel, MuteModelCreationAttributes> implements MuteModel {
	/**
	 * The ID of this mute (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The user who is muted
	 */
	user: Snowflake;
	/**
	 * The guild they are muted in
	 */
	guild: Snowflake;
	/**
	 * The date at which this Mute expires and should be unmuted (optional)
	 */
	expires: Date | null;
	/**
	 * The ref to the modlog entry
	 */
	modlog: string;

	static initModel(sequelize: Sequelize): void {
		Mute.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
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
