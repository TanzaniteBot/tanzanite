import { type Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

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
	public declare pk: string;

	/**
	 * The user that the highlight is for.
	 */
	public declare user: Snowflake;

	/**
	 * The guild to look for highlights in.
	 */
	public declare guild: Snowflake;

	/**
	 * The words to look for.
	 */
	public declare words: HighlightWord[];

	/**
	 * Channels that the user choose to ignore highlights in.
	 */
	public declare blacklistedChannels: Snowflake[];

	/**
	 * Users that the user choose to ignore highlights from.
	 */
	public declare blacklistedUsers: Snowflake[];

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
