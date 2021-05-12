import { Optional } from 'sequelize/types';
import { BaseModel } from './BaseModel';

export interface LevelModel {
	id: string;
	xp: number;
}

export type LevelModelCreationAttributes = Optional<LevelModel, 'xp'>;

export class Level extends BaseModel<LevelModel, LevelModelCreationAttributes> {
	public id: string;
	public xp: number;
	get level(): number {
		return Level.convertXpToLevel(this.xp);
	}
	static convertXpToLevel(xp: number): number {
		// WIP
		return 0;
	}
}
