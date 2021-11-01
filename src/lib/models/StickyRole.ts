import { type Snowflake } from 'discord.js';
import { DataTypes, type Sequelize } from 'sequelize';
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

export class StickyRole extends BaseModel<StickyRoleModel, StickyRoleModelCreationAttributes> implements StickyRoleModel {
	/** 
	 * The id of the user the roles belongs to. 
	 */
	public declare user: Snowflake;

	/** 
	 * The guild where this should happen. 
	 */
	public declare guild: Snowflake;

	/** 
	 * The roles that the user should have returned 
	 */
	public declare roles: Snowflake[];

	/** 
	 * The user's previous nickname 
	 */
	public declare nickname: string;

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
