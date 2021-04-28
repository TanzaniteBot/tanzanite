import { Optional } from 'sequelize';
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
}

export interface BanModel {
	id: string;
	user: string;
	guild: string;
	reason: string;
	expires: Date;
	modlog: string;
}
export interface BanModelCreationAttributes {
	id?: string;
	user: string;
	guild: string;
	reason?: string;
	expires?: Date;
	modlog: string;
}

export class Ban
	extends BaseModel<BanModel, BanModelCreationAttributes>
	implements BanModel {
	/**
	 * The ID of this ban (no real use just for a primary key)
	 */
	id: string;
	/**
	 * The user who is banned
	 */
	user: string;
	/**
	 * The guild they are banned from
	 */
	guild: string;
	/**
	 * The reason they are banned (optional)
	 */
	reason: string | null;
	/**
	 * The date at which this ban expires and should be unbanned (optional)
	 */
	expires: Date | null;
	/**
	 * The ref to the modlog entry
	 */
	modlog: string;
}

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
