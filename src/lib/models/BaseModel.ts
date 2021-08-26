import { Model } from 'sequelize';
import { NEVER_USED } from './__helpers';

export abstract class BaseModel<A, B> extends Model<A, B> {
	/**
	 * The date when the row was created.
	 */
	public get createdAt(): Date {
		throw new Error(NEVER_USED);
	}

	/**
	 * The date when the row was last updated.
	 */
	public get updatedAt(): Date {
		throw new Error(NEVER_USED);
	}
}
