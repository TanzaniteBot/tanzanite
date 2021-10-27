import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { jsonArray } from './__helpers';

export interface StickyRoleModel {
	user: Snowflake;
	guild: Snowflake;
	roles: Snowflake[];
	nickname: string;
}
export interface StickyRoleModelCreationAttributes {
	user: Snowflake;
	guild: Snowflake;
	roles: Snowflake[];
	nickname?: string;
}

// declaration merging so that the fields don't override Sequelize's getters
export interface StickyRole {
	/** The id of the user the roles belongs to. */
	user: Snowflake;

	/** The guild where this should happen. */
	guild: Snowflake;

	/** The roles that the user should have returned */
	roles: Snowflake[];

	/** The user's previous nickname */
	nickname: string;
}

export class StickyRole extends BaseModel<StickyRoleModel, StickyRoleModelCreationAttributes> implements StickyRoleModel {
	public static initModel(sequelize: Sequelize): void {
		StickyRole.init(
			{
				user: { type: DataTypes.STRING, allowNull: false },
				guild: { type: DataTypes.STRING, allowNull: false },
				roles: jsonArray('roles'),
				nickname: { type: DataTypes.STRING, allowNull: true }
			},
			{ sequelize }
		);
	}
}
