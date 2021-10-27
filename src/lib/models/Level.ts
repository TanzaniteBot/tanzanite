import { Snowflake } from 'discord.js';
import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

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

// declaration merging so that the fields don't override Sequelize's getters
export interface Level {
	/** The user's id. */
	user: Snowflake;

	/** The guild where the user is gaining xp. */
	guild: Snowflake;

	/**The user's xp.*/
	xp: number;
}

export class Level extends BaseModel<LevelModel, LevelModelCreationAttributes> implements LevelModel {
	/** The user's level. */
	public get level(): number {
		return Level.convertXpToLevel(this.xp);
	}

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
		let i = 1;
		let lvl: number;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const neededXp = Level.convertLevelToXp(i);
			if (neededXp > xp) {
				lvl = i;
				break;
			} else {
				i++;
			}
		}
		return lvl - 1; // I have to do this don't question it ok
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
