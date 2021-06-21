import { Snowflake } from 'discord.js';
import { DataTypes, Optional, Sequelize } from 'sequelize';
import { BushClient } from '../extensions/BushClient';
import { BaseModel } from './BaseModel';

export interface GuildModel {
	id: string;
	prefix: string;
	autoPublishChannels: string[];
	blacklistedChannels: Snowflake[];
}

export type GuildModelCreationAttributes = Optional<GuildModel, 'prefix' | 'autoPublishChannels' | 'blacklistedChannels'>;

export class Guild extends BaseModel<GuildModel, GuildModelCreationAttributes> implements GuildModel {
	id: string;
	prefix: string;
	autoPublishChannels: string[];
	blacklistedChannels: Snowflake[];
	static initModel(seqeulize: Sequelize, client: BushClient): void {
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
				},
				autoPublishChannels: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				},
				blacklistedChannels: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true
				}
			},
			{ sequelize: seqeulize }
		);
	}
}
