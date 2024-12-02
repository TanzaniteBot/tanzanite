import type { BadWords } from '#lib/automod/AutomodShared.js';
import type { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export interface SharedModel {
	primaryKey: 0;
	superUsers: Snowflake[];
	privilegedUsers: Snowflake[];
	badLinksSecret: string[];
	badLinks: string[];
	badWords: BadWords;
	autoBanCode: string | null;
	promptToBanCode: string | null;
}

export interface SharedModelCreationAttributes {
	primaryKey?: 0;
	superUsers?: Snowflake[];
	privilegedUsers?: Snowflake[];
	badLinksSecret?: string[];
	badLinks?: string[];
	badWords?: BadWords;
	autoBanCode?: string;
	promptToBanCode?: string;
}

/**
 * Data shared between all bot instances.
 */
export class Shared extends BaseModel<SharedModel, SharedModelCreationAttributes> implements SharedModel {
	/**
	 * The primary key of the shared model.
	 */
	declare public primaryKey: 0;

	/**
	 * Trusted users.
	 */
	declare public superUsers: Snowflake[];

	/**
	 * Users that have all permissions that devs have except eval.
	 */
	declare public privilegedUsers: Snowflake[];

	/**
	 * Non-public bad links.
	 */
	declare public badLinksSecret: string[];

	/**
	 * Public Bad links.
	 */
	declare public badLinks: string[];

	/**
	 * Bad words.
	 */
	declare public badWords: BadWords;

	/**
	 * Code that is used to match for auto banning users in moulberry's bush
	 */
	declare public autoBanCode: string;

	declare public promptToBanCode: string;

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
				autoBanCode: { type: DataTypes.TEXT },
				promptToBanCode: { type: DataTypes.TEXT }
			},
			{ sequelize, freezeTableName: true }
		);
	}
}
