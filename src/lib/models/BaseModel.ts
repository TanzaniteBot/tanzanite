import { Model } from 'sequelize';

export abstract class BaseModel<A, B> extends Model<A, B> {
	/**
	 * The date when the row was created.
	 */
	public get createdAt(): Date {
		throw new Error('This should never be executed');
	}

	/**
	 * The date when the row was last updated.
	 */
	public get updatedAt(): Date {
		throw new Error('This should never be executed');
	}
}
