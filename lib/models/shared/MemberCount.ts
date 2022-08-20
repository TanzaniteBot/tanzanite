import { DataTypes, Model, type Sequelize } from 'sequelize';

export interface MemberCountModel {
	timestamp: Date;
	guildId: string;
	memberCount: number;
}

export interface MemberCountCreationAttributes {
	timestamp?: Date;
	guildId: string;
	memberCount: number;
}

/**
 * The member count of each guild that the bot is in that have over 100 members.
 */
export class MemberCount extends Model<MemberCountModel, MemberCountCreationAttributes> implements MemberCountModel {
	public declare timestamp: Date;
	public declare guildId: string;
	public declare memberCount: number;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		MemberCount.init(
			{
				timestamp: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
				guildId: { type: DataTypes.STRING, allowNull: false },
				memberCount: { type: DataTypes.BIGINT, allowNull: false }
			},
			{ sequelize, timestamps: false }
		);
	}
}
