import { BushCommand, Reminder, Time, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class RemindCommand extends BushCommand {
	public constructor() {
		super('remind', {
			aliases: ['remind', 'remindme', 'reminder'],
			category: 'utilities',
			description: 'Create reminders that will be DMed to you when the time expires.',
			usage: ['remind <duration> <reminder>'],
			examples: ['template 1 2'],
			args: [
				{
					id: 'reminder',
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
		args: { reminder: ArgType<'contentWithDuration'> | string }
	) {
		const { duration, content } = await util.castDurationContent(args.reminder, message);

		if (!content.trim()) return await message.util.reply(`${util.emojis.error} Please enter a reason to be reminded about.`);
		if (!duration) return await message.util.reply(`${util.emojis.error} Please enter a time to remind you in.`);

		if (duration < Time.Second * 30)
			return await message.util.reply(`${util.emojis.error} You cannot be reminded in less than 30 seconds.`);

		const expires = new Date(Date.now() + duration);

		const success = await Reminder.create({
			content: content.trim(),
			messageUrl: message.url!,
			user: message.author.id,
			created: new Date(),
			expires: expires
		}).catch(() => false);

		if (!success) return await message.util.reply(`${util.emojis.error} Could not create a reminder.`);

		// This isn't technically accurate, but it prevents it from being .99 seconds
		const delta = util.format.bold(util.dateDelta(new Date(Date.now() + duration)));
		return await message.util.reply(`${util.emojis.success} I will remind you in ${delta} (${util.timestamp(expires, 'T')}).`);
	}
}
