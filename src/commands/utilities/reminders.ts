import { BushCommand, ButtonPaginator, Reminder, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { APIEmbed } from 'discord-api-types/v9';
import { PermissionFlagsBits } from 'discord.js';
import { Op } from 'sequelize';

assert(Op);

export default class RemindersCommand extends BushCommand {
	public constructor() {
		super('reminders', {
			aliases: ['reminders', 'view-reminders', 'list-reminders'],
			category: 'utilities',
			description: 'List all your current reminders.',
			usage: ['reminder'],
			examples: ['reminders'],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks]),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		const reminders = await Reminder.findAll({ where: { user: message.author.id, expires: { [Op.gt]: new Date() } } });
		if (!reminders.length) return message.util.send(`${util.emojis.error} You don't have any reminders set.`);

		const formattedReminders = reminders.map((reminder) => `${util.timestamp(reminder.expires, 't')} - ${reminder.content}`);

		const chunked = util.chunk(formattedReminders, 15);
		const embeds: APIEmbed[] = chunked.map((chunk) => ({
			title: `Reminders`,
			description: chunk.join('\n'),
			color: util.colors.default
		}));
		return await ButtonPaginator.send(message, embeds);
	}
}
