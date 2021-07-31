import { Model } from 'sequelize';

export abstract class BaseModel<A, B> extends Model<A, B> {
	/**
	 * The date when the row was created.
	 */
	public get createdAt(): Date {
		return null;
	}

	/**
	 * The date when the row was last updated.
	 */
	public get updatedAt(): Date {
		return null;
	}
}
