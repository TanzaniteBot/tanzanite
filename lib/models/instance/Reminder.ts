import type { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { DataTypes, type Sequelize } from 'sequelize';
import { BaseModel } from '../BaseModel.js';

export interface ReminderModel {
	id: string;
	user: Snowflake;
	messageUrl: string;
	content: string;
	created: Date;
	expires: Date;
	notified: boolean;
}

export interface ReminderModelCreationAttributes {
	id?: string;
	user: Snowflake;
	messageUrl: string;
	content: string;
	created: Date;
	expires: Date;
	notified?: boolean;
}

/**
 * Represents a reminder the a user has set.
 */
export class Reminder extends BaseModel<ReminderModel, ReminderModelCreationAttributes> implements ReminderModel {
	/**
	 * The id of the reminder.
	 */
	declare public id: string;

	/**
	 * The user that the reminder is for.
	 */
	declare public user: Snowflake;

	/**
	 * The url of the message where the reminder was created.
	 */
	declare public messageUrl: string;

	/**
	 * The content of the reminder.
	 */
	declare public content: string;

	/**
	 * The date the reminder was created.
	 */
	declare public created: Date;

	/**
	 * The date when the reminder expires.
	 */
	declare public expires: Date;

	/**
	 * Whether the user has been notified about the reminder.
	 */
	declare public notified: boolean;

	/**
	 * Initializes the model.
	 * @param sequelize The sequelize instance.
	 */
	public static initModel(sequelize: Sequelize): void {
		Reminder.init(
			{
				id: { type: DataTypes.STRING, primaryKey: true, defaultValue: nanoid },
				user: { type: DataTypes.STRING, allowNull: false },
				messageUrl: { type: DataTypes.STRING, allowNull: false },
				content: { type: DataTypes.TEXT, allowNull: false },
				created: { type: DataTypes.DATE, allowNull: false },
				expires: { type: DataTypes.DATE, allowNull: false },
				notified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
			},
			{ sequelize }
		);
	}
}
