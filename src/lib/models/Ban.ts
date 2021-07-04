import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from '..';

export interface BanModel {
	id: string;
	user: string;
	guild: string;
	expires: Date;
	modlog: string;
}
export interface BanModelCreationAttributes {
	id?: string;
	user: string;
	guild: string;
	expires?: Date;
	modlog: string;
}

export class Ban extends BaseModel<BanModel, BanModelCreationAttributes> implements BanModel {
	/**
	 * The ID of this ban (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The user who is banned
	 */
	user: Snowflake;
	/**
	 * The guild they are banned from
	 */
	guild: Snowflake;
	/**
	 * The date at which this ban expires and should be unbanned (optional)
	 */
	expires: Date | null;
	/**
	 * The ref to the modlog entry
	 */
	modlog: string;

	static initModel(sequelize: Sequelize): void {
		Ban.init(
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
