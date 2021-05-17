import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface LevelModel {
	id: string;
	xp: number;
}

export interface LevelModelCreationAttributes {
	id: string;
	xp?: number;
}

export class Level extends BaseModel<LevelModel, LevelModelCreationAttributes> {
	public id: string;
	public xp: number;
	get level(): number {
		return Level.convertXpToLevel(this.xp);
	}

	static initModel(sequelize: Sequelize): void {
		Level.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false
				},
				xp: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0
				}
			},
			{ sequelize: sequelize }
		);
	}
	static convertXpToLevel(xp: number): number {
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
				continue;
			}
		}
		return lvl - 1; // I have to do this don't question it ok
	}
	static convertLevelToXp(level: number): number {
		let xp = 0;
		for (let i = 0; i < level; i++) {
			xp += 100 * i + 75;
		}
		return xp;
	}
	static genRandomizedXp(): number {
		return Math.floor(Math.random() * (40 - 15 + 1)) + 15;
	}
}
