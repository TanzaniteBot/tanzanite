import { Snowflake } from 'discord.js';
import { DataTypes, Optional, Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel';

export interface GlobalModel {
	superUsers: Snowflake[];
	disabledCommands: string[];
	blacklistedUsers: Snowflake[];
	blacklistedGuilds: Snowflake[];
	blacklistedChannels: Snowflake[];
}
export type GlobalModelCreationAttributes = Optional<
	GlobalModel,
	'superUsers' | 'disabledCommands' | 'blacklistedUsers' | 'blacklistedGuilds' | 'blacklistedChannels'
>;

export class Global extends BaseModel<GlobalModel, GlobalModelCreationAttributes> implements GlobalModel {
	superUsers: Snowflake[];
	disabledCommands: string[];
	blacklistedUsers: Snowflake[];
	blacklistedGuilds: Snowflake[];
	blacklistedChannels: Snowflake[];
	static initModel(sequelize: Sequelize): void {
		Global.init(
			{
				superUsers: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				disabledCommands: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				blacklistedUsers: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				blacklistedGuilds: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				blacklistedChannels: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				}
			},
			{ sequelize }
		);
	}
}
