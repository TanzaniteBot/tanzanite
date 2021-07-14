import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './BaseModel';

export interface PunishmentRoleModel {
	id: string;
	user: Snowflake;
	role: Snowflake;
	guild: Snowflake;
	expires: Date;
	modlog: string;
}
export interface PunishmentRoleModelCreationAttributes {
	id?: string;
	user: Snowflake;
	role?: Snowflake;
	guild: Snowflake;
	expires?: Date;
	modlog: string;
}

export class PunishmentRole
	extends BaseModel<PunishmentRoleModel, PunishmentRoleModelCreationAttributes>
	implements PunishmentRoleModel
{
	/**
	 * The ID of this punishment role (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The user who received a role
	 */
	user: Snowflake;
	/**
	 * The role added to the user.
	 */
	role: Snowflake;
	/**
	 * The guild they received a role in
	 */
	guild: Snowflake;
	/**
	 * The date at which this role expires and should be removed (optional)
	 */
	expires: Date | null;
	/**
	 * The ref to the modlog entry
	 */
	modlog: string;

	static initModel(sequelize: Sequelize): void {
		PunishmentRole.init(
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
				role: {
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
