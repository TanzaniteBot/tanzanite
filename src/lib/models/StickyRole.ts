import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface StickyRoleModel {
	user: Snowflake;
	guild: Snowflake;
	roles: Snowflake[];
}
export interface StickyRoleModelCreationAttributes {
	user: Snowflake;
	guild: Snowflake;
	roles: Snowflake[];
}

export class StickyRole extends BaseModel<StickyRoleModel, StickyRoleModelCreationAttributes> implements StickyRoleModel {
	user: Snowflake;
	guild: Snowflake;
	roles: Snowflake[];
	static initModel(sequelize: Sequelize): void {
		StickyRole.init(
			{
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				guild: {
					type: DataTypes.STRING,
					allowNull: false
				},

				roles: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: false
				}
			},
			{ sequelize }
		);
	}
}
