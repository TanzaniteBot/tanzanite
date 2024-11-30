import type { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export interface HighlightModel {
	pk: string;
	user: Snowflake;
	guild: Snowflake;
	words: HighlightWord[];
	blacklistedChannels: Snowflake[];
	blacklistedUsers: Snowflake[];
}

export interface HighLightCreationAttributes {
	pk?: string;
	user: Snowflake;
	guild: Snowflake;
	words?: HighlightWord[];
	blacklistedChannels?: Snowflake[];
	blacklistedUsers?: Snowflake[];
}

export interface HighlightWord {
	word: string;
	regex: boolean;
}

/**
 * List of words that should cause the user to be notified for if found in the specified guild.
 */
export class Highlight extends BaseModel<HighlightModel, HighLightCreationAttributes> implements HighlightModel {
	/**
	 * The primary key of the highlight.
	 */
	declare public pk: string;

	/**
	 * The user that the highlight is for.
	 */
	declare public user: Snowflake;

	/**
	 * The guild to look for highlights in.
	 */
	declare public guild: Snowflake;

	/**
	 * The words to look for.
	 */
	declare public words: HighlightWord[];

	/**
	 * Channels that the user choose to ignore highlights in.
	 */
	declare public blacklistedChannels: Snowflake[];

	/**
	 * Users that the user choose to ignore highlights from.
	 */
	declare public blacklistedUsers: Snowflake[];

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Highlight.init(
			{
				pk: { type: DataTypes.STRING, primaryKey: true, defaultValue: nanoid },
				user: { type: DataTypes.STRING, allowNull: false },
				guild: { type: DataTypes.STRING, allowNull: false },
				words: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedChannels: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
				blacklistedUsers: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] }
			},
			{ sequelize }
		);
	}
}
