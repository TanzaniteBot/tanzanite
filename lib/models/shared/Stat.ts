import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

type Environment = 'production' | 'development' | 'beta';

export interface StatModel {
	environment: Environment;
	commandsUsed: bigint;
	slashCommandsUsed: bigint;
}

export interface StatModelCreationAttributes {
	environment: Environment;
	commandsUsed?: bigint;
	slashCommandsUsed?: bigint;
}

/**
 * Statistics for each instance of the bot.
 */
export class Stat extends BaseModel<StatModel, StatModelCreationAttributes> implements StatModel {
	/**
	 * The bot's environment.
	 */
	declare public environment: Environment;

	/**
	 * The number of commands used
	 */
	declare public commandsUsed: bigint;

	/**
	 * The number of slash commands used
	 */
	declare public slashCommandsUsed: bigint;

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
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						return this.setDataValue('commandsUsed', <any>`${val}`);
					},
					allowNull: false,
					defaultValue: `${0n}`
				},
				slashCommandsUsed: {
					type: DataTypes.TEXT,
					get: function (): bigint {
						return BigInt(this.getDataValue('slashCommandsUsed'));
					},
					set: function (val: bigint) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						return this.setDataValue('slashCommandsUsed', <any>`${val}`);
					},
					allowNull: false,
					defaultValue: `${0n}`
				}
			},
			{ sequelize }
		);
	}
}
