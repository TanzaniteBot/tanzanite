import type { Environment } from '#config';
import { DataTypes, Model, type Sequelize } from 'sequelize';

export interface GuildCountModel {
	timestamp: Date;
	environment: Environment;
	guildCount: number;
}

export interface GuildCountCreationAttributes {
	timestamp?: Date;
	environment: Environment;
	guildCount: number;
}

/**
 * The number of guilds that the bot is in for each environment.
 */
export class GuildCount extends Model<GuildCountModel, GuildCountCreationAttributes> implements GuildCountModel {
	public declare timestamp: Date;
	public declare environment: Environment;
	public declare guildCount: number;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		GuildCount.init(
			{
				timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
				environment: { type: DataTypes.STRING, allowNull: false },
				guildCount: { type: DataTypes.BIGINT, allowNull: false }
			},
			{ sequelize, timestamps: false }
		);
	}
}
