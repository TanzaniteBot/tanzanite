import { type Snowflake } from 'discord.js';
import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';

const { DataTypes } = (await import('sequelize')).default;

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

export class Level extends BaseModel<LevelModel, LevelModelCreationAttributes> implements LevelModel {
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
		let i = 0;
		while (Level.convertLevelToXp(i + 1) < xp) {
			i++;
		}
		return i;
	}

	public static convertLevelToXp(level: number): number {
		let xp = 0;
		for (let i = 0; i < level; i++) {
			xp += 100 * i + 75;
		}
		return xp;
	}

	public static genRandomizedXp(): number {
		return Math.floor(Math.random() * (40 - 15 + 1)) + 15;
	}
}
