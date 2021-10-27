import { Model } from 'sequelize';

// declaration merging so that the fields don't override Sequelize's getters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BaseModel<A, B> {
	/** The date when the row was created. */
	readonly createdAt: Date;

	/** The date when the row was last updated. */
	readonly updatedAt: Date;
}

export abstract class BaseModel<A, B> extends Model<A, B> {}
