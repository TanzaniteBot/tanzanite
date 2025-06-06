import {
	AllIntegrationTypes,
	AllInteractionContexts,
	BotCommand,
	ButtonPaginator,
	Reminder,
	chunk,
	colors,
	emojis,
	timestamp,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import type { APIEmbed } from 'discord.js';
import assert from 'node:assert/strict';
import { Op } from 'sequelize';

assert(Op);

export default class RemindersCommand extends BotCommand {
	public constructor() {
		super('reminders', {
			aliases: ['reminders', 'view-reminders', 'list-reminders'],
			category: 'utilities',
			description: 'List all your current reminders.',
			usage: ['reminder'],
			examples: ['reminders'],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		const reminders = await Reminder.findAll({ where: { user: message.author.id, expires: { [Op.gt]: new Date() } } });
		if (!reminders.length) return message.util.send(`${emojis.error} You don't have any reminders set.`);

		const formattedReminders = reminders.map((reminder) => `${timestamp(reminder.expires, 't')} - ${reminder.content}`);

		const chunked = chunk(formattedReminders, 15);
		const embeds: APIEmbed[] = chunked.map((chunk) => ({
			title: `Reminders`,
			description: chunk.join('\n'),
			color: colors.default
		}));
		return await ButtonPaginator.send(message, embeds);
	}
}
