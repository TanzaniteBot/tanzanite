import { type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

type Environment = 'production' | 'development' | 'beta';

export interface StatModel {
	environment: Environment;
	commandsUsed: bigint;
}

export interface StatModelCreationAttributes {
	environment: Environment;
	commandsUsed?: bigint;
}

export class Stat extends BaseModel<StatModel, StatModelCreationAttributes> implements StatModel {
	/**
	 * The bot's environment.
	 */
	public declare environment: Environment;

	/**
	 * The number of commands used
	 */
	public declare commandsUsed: bigint;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Stat.init(
			{
				environment: { type: DataTypes.STRING, primaryKey: true },
				commandsUsed: {
					type: DataTypes.TEXT,
					get: function (): bigint {
						return BigInt(this.getDataValue('commandsUsed'));
					},
					set: function (val: bigint) {
						return this.setDataValue('commandsUsed', <any>`${val}`);
					},
					allowNull: false,
					defaultValue: `${0n}`
				}
			},
			{ sequelize }
		);
	}
}
