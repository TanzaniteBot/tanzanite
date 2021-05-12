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
