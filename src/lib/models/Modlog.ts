import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './BaseModel';

export enum ModLogType {
	BAN = 'BAN',
	TEMP_BAN = 'TEMP_BAN',
	KICK = 'KICK',
	MUTE = 'MUTE',
	TEMP_MUTE = 'TEMP_MUTE',
	WARN = 'WARN',
	PUNISHMENT_ROLE = 'PUNISHMENT_ROLE',
	TEMP_PUNISHMENT_ROLE = 'TEMP_PUNISHMENT_ROLE'
}

export interface ModLogModel {
	id: string;
	type: ModLogType;
	user: string;
	moderator: string;
	reason: string;
	duration: number;
	guild: string;
}

export interface ModLogModelCreationAttributes {
	id?: string;
	type: ModLogType;
	user: string;
	moderator: string;
	reason?: string;
	duration?: number;
	guild: string;
}

export class ModLog extends BaseModel<ModLogModel, ModLogModelCreationAttributes> implements ModLogModel {
	id: string;
	type: ModLogType;
	user: string;
	moderator: string;
	guild: string;
	reason: string | null;
	duration: number | null;

	static initModel(sequelize: Sequelize): void {
		ModLog.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				type: {
					type: DataTypes.STRING, //# This is not an enum because of a sequelize issue: https://github.com/sequelize/sequelize/issues/2554
					allowNull: false
				},
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				moderator: {
					type: DataTypes.STRING,
					allowNull: false
				},
				duration: {
					type: DataTypes.STRING,
					allowNull: true
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: true
				},
				guild: {
					type: DataTypes.STRING,
					references: {
						model: 'Guilds',
						key: 'id'
					}
				}
			},
			{ sequelize: sequelize }
		);
	}
}
