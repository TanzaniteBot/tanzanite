import { BushTask, dateDelta, format, Reminder, Time } from '#lib';
const { Op } = (await import('sequelize')).default;

export default class HandlerRemindersTask extends BushTask {
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
			setTimeout(() => {
				void this.client.users
					.send(
						entry.user,
						`The reminder you set ${dateDelta(entry.created)} ago has expired: ${format.bold(entry.content)}
${entry.messageUrl}`
					)
					.catch(() => false);
				void entry.update({ notified: true });
			}, entry.expires.getTime() - new Date().getTime());
		}
	}
}
