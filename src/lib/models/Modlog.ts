import { DataTypes, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from './BaseModel';

export enum ModlogType {
	BAN = 'BAN',
	TEMPBAN = 'TEMPBAN',
	KICK = 'KICK',
	MUTE = 'MUTE',
	TEMPMUTE = 'TEMPMUTE',
	WARN = 'WARN'
}

export interface ModlogModel {
	id: string;
	type: ModlogType;
	user: string;
	moderator: string;
	reason: string;
	duration: number;
	guild: string;
}

export interface ModlogModelCreationAttributes {
	id?: string;
	type: ModlogType;
	user: string;
	moderator: string;
	reason?: string;
	duration?: number;
	guild: string;
}

export class Modlog extends BaseModel<ModlogModel, ModlogModelCreationAttributes> implements ModlogModel {
	id: string;
	type: ModlogType;
	user: string;
	moderator: string;
	guild: string;
	reason: string | null;
	duration: number | null;

	static initModel(sequelize: Sequelize): void {
		Modlog.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				type: {
					type: new DataTypes.ENUM('BAN', 'TEMPBAN', 'MUTE', 'TEMPMUTE', 'KICK', 'WARN'),
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
					type: DataTypes.STRING
					// references: {
					// 	model: Models.Guild,
					// 	key: 'id'
					// }
				}
			},
			{ sequelize }
		);
	}
}
