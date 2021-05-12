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

export class Modlog
	extends BaseModel<ModlogModel, ModlogModelCreationAttributes>
	implements ModlogModel {
	id: string;
	type: ModlogType;
	user: string;
	moderator: string;
	guild: string;
	reason: string | null;
	duration: number | null;
}
