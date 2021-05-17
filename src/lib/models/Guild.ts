import { DataTypes, Optional, Sequelize } from 'sequelize';
import { BotClient } from '../extensions/BotClient';
import { BaseModel } from './BaseModel';

export interface GuildModel {
	id: string;
	prefix: string;
}
export type GuildModelCreationAttributes = Optional<GuildModel, 'prefix'>;

export class Guild
	extends BaseModel<GuildModel, GuildModelCreationAttributes>
	implements GuildModel {
	id: string;
	prefix: string;
	static initModel(seqeulize: Sequelize, client: BotClient): void {
		Guild.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				prefix: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: client.config.prefix
				}
			},
			{ sequelize: seqeulize }
		);
	}
}
