import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import * as Models from './';
import { v4 as uuidv4 } from 'uuid';

export interface BanModel {
	id: string;
	user: string;
	guild: string;
	reason: string;
	expires: Date;
	modlog: string;
}
export interface BanModelCreationAttributes {
	id?: string;
	user: string;
	guild: string;
	reason?: string;
	expires?: Date;
	modlog: string;
}

export class Ban
	extends BaseModel<BanModel, BanModelCreationAttributes>
	implements BanModel
{
	/**
	 * The ID of this ban (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The user who is banned
	 */
	user: string;
	/**
	 * The guild they are banned from
	 */
	guild: string;
	/**
	 * The reason they are banned (optional)
	 */
	reason: string | null;
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
						model: Models.Guild,
						key: 'id'
					}
				},
				expires: {
					type: DataTypes.DATE,
					allowNull: true
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: true
				},
				modlog: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						model: Models.Modlog
					}
				}
			},
			{ sequelize: sequelize }
		);
	}
}
