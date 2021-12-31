import { Snowflake } from 'discord.js';
import { nanoid } from 'nanoid';
import { type Sequelize } from 'sequelize';
import { BaseModel } from './BaseModel.js';
const { DataTypes } = (await import('sequelize')).default;

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

export class Reminder extends BaseModel<ReminderModel, ReminderModelCreationAttributes> implements ReminderModel {
	/**
	 * The id of the reminder.
	 */
	public declare id: string;

	/**
	 * The user that the reminder is for.
	 */
	public declare user: Snowflake;

	/**
	 * The url of the message where the reminder was created.
	 */
	public declare messageUrl: string;

	/**
	 * The content of the reminder.
	 */
	public declare content: string;

	/**
	 * The date the reminder was created.
	 */
	public declare created: Date;

	/**
	 * The date when the reminder expires.
	 */
	public declare expires: Date;

	/**
	 * Whether the user has been notified about the reminder.
	 */
	public declare notified: boolean;

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
