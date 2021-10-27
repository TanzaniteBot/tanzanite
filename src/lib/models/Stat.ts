import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { jsonBigint } from './__helpers';

type Environment = 'production' | 'development' | 'beta';

export interface StatModel {
	environment: Environment;
	commandsUsed: bigint;
}

export interface StatModelCreationAttributes {
	environment: Environment;
	commandsUsed?: bigint;
}

// declaration merging so that the fields don't override Sequelize's getters
export interface Stat {
	/** The bot's environment. */
	environment: Environment;

	/** The number of commands used */
	commandsUsed: bigint;
}

export class Stat extends BaseModel<StatModel, StatModelCreationAttributes> implements StatModel {
	public static initModel(sequelize: Sequelize): void {
		Stat.init(
			{
				environment: { type: DataTypes.STRING, primaryKey: true },
				commandsUsed: jsonBigint('commandsUsed')
			},
			{ sequelize }
		);
	}
}
