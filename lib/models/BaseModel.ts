import { Model } from 'sequelize';

export abstract class BaseModel<A extends {}, B extends {}> extends Model<A, B> {
	/**
	 * The date when the row was created.
	 */
	declare public readonly createdAt: Date;

	/**
	 * The date when the row was last updated.
	 */
	declare public readonly updatedAt: Date;
}
