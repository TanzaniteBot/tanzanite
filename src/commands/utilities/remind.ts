import { BushCommand, Reminder, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class RemindCommand extends BushCommand {
	public constructor() {
		super('remind', {
			aliases: ['remind', 'remindme', 'reminder'],
			category: 'utilities',
			description: 'Create reminders that will be DMed to you when the time expires.',
			usage: ['remind <duration> <reason>'],
			examples: ['template 1 2'],
			args: [
				{
					id: 'reason_and_duration',
					type: 'contentWithDuration',
					match: 'rest',
					description: 'The reason to be reminded and the duration to remind the user in.',
					prompt: 'What would you like to be reminded about and when?',
					retry: '{error} Choose a reason to be reminded about with a duration for when to be notified.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { reason_and_duration: ArgType<'contentWithDuration'> | string }
	) {
		const { duration, contentWithoutTime: reason } =
			typeof args.reason_and_duration === 'string'
				? await util.arg.cast('contentWithDuration', message, args.reason_and_duration)
				: args.reason_and_duration;

		if (!reason?.trim()) return await message.util.reply(`${util.emojis.error} Please enter a reason to be reminded about.`);
		if (!duration) return await message.util.reply(`${util.emojis.error} Please enter a duration.`);

		if (duration < 30_000)
			return await message.util.reply(`${util.emojis.error} You cannot pick a duration less than 30 seconds.`);

		const created = new Date();
		const expires = new Date(Date.now() + duration);
		const delta = util.format.bold(util.dateDelta(expires));

		const success = await Reminder.create({
			content: reason.trim(),
			messageUrl: message.url!,
			user: message.author.id,
			created,
			expires
		}).catch(() => false);

		if (!success) return await message.util.reply(`${util.emojis.error} Could not create a reminder.`);
		return await message.util.reply(`${util.emojis.success} I will remind you in ${delta} (${util.timestamp(expires, 'T')}).`);
	}
}
