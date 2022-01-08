import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
import { jsonArray } from './__helpers.js';
const { DataTypes } = (await import('sequelize')).default;

export interface SharedModel {
	primaryKey: 0;
	superUsers: string[];
	badLinks: string[];
}

export interface SharedModelCreationAttributes {
	primaryKey?: 0;
	superUsers?: string[];
	badLinks?: string[];
}

export class Shared extends BaseModel<SharedModel, SharedModelCreationAttributes> implements SharedModel {
	/**
	 * The primary key of the shared model.
	 */
	public declare primaryKey: 0;

	/**
	 * Trusted users.
	 */
	public declare superUsers: string[];

	//todo
	/**
	 * Bad links.
	 */
	public declare badLinks: string[];

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Shared.init(
			{
				primaryKey: { type: DataTypes.INTEGER, primaryKey: true, validate: { min: 0, max: 0 } },
				superUsers: jsonArray('superUsers'),
				badLinks: jsonArray('badLinks')
			},
			{ sequelize, freezeTableName: true }
		);
	}
}
