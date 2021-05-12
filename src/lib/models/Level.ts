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
	static convertXpToLevel(xp: number): number {
		// WIP
		return 0;
	}
	static convertLevelToXp(xp: number): number {
		// WIP
		return 0;
	}
}
