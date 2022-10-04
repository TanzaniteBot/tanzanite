import { type Snowflake } from 'discord.js';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export interface LevelModel {
	user: Snowflake;
	guild: Snowflake;
	xp: number;
}

export interface LevelModelCreationAttributes {
	user: Snowflake;
	guild: Snowflake;
	xp?: number;
}

/**
 * Leveling information for a user in a guild.
 */
export class Level extends BaseModel<LevelModel, LevelModelCreationAttributes> implements LevelModel {
	public static MAX_XP = 2147483647;
	public static MAX_LEVEL = Level.convertXpToLevel(Level.MAX_XP);

	/**
	 * The user's id.
	 */
	public declare user: Snowflake;

	/**
	 * The guild where the user is gaining xp.
	 */
	public declare guild: Snowflake;

	/**
	 * The user's xp.
	 */
	public declare xp: number;

	/**
	 * The user's level.
	 */
	public get level(): number {
		return Level.convertXpToLevel(this.xp);
	}

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Level.init(
			{
				user: { type: DataTypes.STRING, allowNull: false },
				guild: { type: DataTypes.STRING, allowNull: false },
				xp: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
			},
			{ sequelize }
		);
	}

	public static convertXpToLevel(xp: number): number {
		return Math.floor((-25 + Math.sqrt(625 + 200 * xp)) / 100);
	}

	public static convertLevelToXp(level: number): number {
		return 50 * level * level + 25 * level; // 50x² + 25x
	}

	public static genRandomizedXp(): number {
		return Math.floor(Math.random() * (40 - 15 + 1)) + 15;
	}
}
