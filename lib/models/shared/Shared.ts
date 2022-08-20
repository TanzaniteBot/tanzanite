import { Snowflake } from 'discord.js';
import type { Sequelize } from 'sequelize';
import { BadWords } from '../../automod/AutomodShared.js';
import { BaseModel } from '../BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

export interface SharedModel {
	primaryKey: 0;
	superUsers: Snowflake[];
	privilegedUsers: Snowflake[];
	badLinksSecret: string[];
	badLinks: string[];
	badWords: BadWords;
	autoBanCode: string | null;
}

export interface SharedModelCreationAttributes {
	primaryKey?: 0;
	superUsers?: Snowflake[];
	privilegedUsers?: Snowflake[];
	badLinksSecret?: string[];
	badLinks?: string[];
	badWords?: BadWords;
	autoBanCode?: string;
}

/**
 * Data shared between all bot instances.
 */
export class Shared extends BaseModel<SharedModel, SharedModelCreationAttributes> implements SharedModel {
	/**
	 * The primary key of the shared model.
	 */
	public declare primaryKey: 0;

	/**
	 * Trusted users.
	 */
	public declare superUsers: Snowflake[];

	/**
	 * Users that have all permissions that devs have except eval.
	 */
	public declare privilegedUsers: Snowflake[];

	/**
	 * Non-public bad links.
	 */
	public declare badLinksSecret: string[];

	/**
	 * Public Bad links.
	 */
	public declare badLinks: string[];

	/**
	 * Bad words.
	 */
	public declare badWords: BadWords;

	/**
	 * Code that is used to match for auto banning users in moulberry's bush
	 */
	public declare autoBanCode: string;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Shared.init(
			{
				primaryKey: { type: DataTypes.INTEGER, primaryKey: true, validate: { min: 0, max: 0 } },
				superUsers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				privilegedUsers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				badLinksSecret: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				badLinks: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				badWords: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
				autoBanCode: { type: DataTypes.TEXT }
			},
			{ sequelize, freezeTableName: true }
		);
	}
}
