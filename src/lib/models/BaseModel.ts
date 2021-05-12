import { Model } from 'sequelize';

export abstract class BaseModel<A, B> extends Model<A, B> {
	public readonly createdAt: Date;
	public readonly updatedAt: Date;
}
