import { BotTask, dateDelta, format, Reminder, Time } from '#lib';
import { Op } from 'sequelize';

export default class HandlerRemindersTask extends BotTask {
	private static ignore = new Set<string>();

	public constructor() {
		super('handlerReminders', {
			delay: 30 * Time.Second,
			runOnStart: true
		});
	}

	public async exec() {
		const expiredEntries = await Reminder.findAll({
			where: {
				expires: {
					[Op.lt]: new Date(Date.now() + 30 * Time.Second) // Find all rows with an expiry date before 30 seconds from now
				},
				notified: false
			}
		});

		void this.client.logger.verbose(
			`handlerReminders`,
			`Queried reminders, found <<${expiredEntries.length}>> expired reminders.`
		);

		for (const entry of expiredEntries) {
			if (HandlerRemindersTask.ignore.has(entry.id)) continue;
			HandlerRemindersTask.ignore.add(entry.id);
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			setTimeout(async () => {
				void this.client.users
					.send(
						entry.user,
						`The reminder you set ${dateDelta(entry.created)} ago has expired: ${format.bold(entry.content)}\n${entry.messageUrl}`
					)
					.catch(() => false);
				await entry.update({ notified: true });
				HandlerRemindersTask.ignore.delete(entry.id);
			}, entry.expires.getTime() - new Date().getTime());
		}
	}
}
