import { DataTypes, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';
import { NEVER_USED } from './__helpers';

export interface StatModel {
	environment: 'production' | 'development' | 'beta';
	commandsUsed: bigint;
}

export interface StatModelCreationAttributes {
	environment: 'production' | 'development' | 'beta';
	commandsUsed?: bigint;
}

export class Stat extends BaseModel<StatModel, StatModelCreationAttributes> implements StatModel {
	/**
	 * The bot's environment.
	 */
	public get environment(): 'production' | 'development' | 'beta' {
		throw new Error(NEVER_USED);
	}
	public set environment(_: 'production' | 'development' | 'beta') {
		throw new Error(NEVER_USED);
	}

	/**
	 * The number of commands used
	 */
	public get commandsUsed(): bigint {
		throw new Error(NEVER_USED);
	}
	public set commandsUsed(_: bigint) {
		throw new Error(NEVER_USED);
	}

	public static initModel(sequelize: Sequelize): void {
		Stat.init(
			{
				environment: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				commandsUsed: {
					type: DataTypes.TEXT,
					allowNull: false,
					get: function (): bigint {
						return BigInt(this.getDataValue('commandsUsed') as unknown as string);
					},
					set: function (val: bigint) {
						return this.setDataValue('commandsUsed', `${val}` as any);
					},
					defaultValue: '0'
				}
			},
			{ sequelize }
		);
	}
}
