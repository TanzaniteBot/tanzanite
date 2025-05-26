import {
	Arg,
	BotCommand,
	TanzaniteEvent,
	emojis,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, Collection, type Message } from 'discord.js';
import assert from 'node:assert/strict';

export default class PurgeCommand extends BotCommand {
	public constructor() {
		super('purge', {
			aliases: ['purge', 'clear'],
			category: 'moderation',
			description: 'A command to mass delete messages.',
			usage: ['purge <amount> [--bot] [--user <user>]'],
			examples: ['purge 20'],
			args: [
				{
					id: 'amount',
					description: 'The amount of messages to purge.',
					type: Arg.range('integer', 1, 100, true),
					readableType: 'integer',
					prompt: 'How many messages would you like to purge?',
					retry: '{error} Please pick a number between 1 and 100.',
					slashType: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: 100
				},
				{
					id: 'bot',
					description: 'Filter messages to only include those that are from bots.',
					match: 'flag',
					flag: '--bot',
					prompt: 'Would you like to only delete messages that are from bots?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'user',
					description: 'Filter messages to only include those that are from a specified user.',
					match: 'option',
					type: 'user',
					flag: '--user',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			clientPermissions: ['ManageMessages', 'EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: ['ManageMessages'],
			userCheckChannel: true,
			channel: 'guild'
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { amount: ArgType<'integer'>; bot: ArgType<'flag'>; user: OptArgType<'user'> }
	) {
		assert(message.inGuild());

		if (args.amount > 100 || args.amount < 1) return message.util.reply(`${emojis.error} `);

		const messageFilter = (filterMessage: Message): boolean => {
			const shouldFilter: boolean[] = [];
			if (args.bot) shouldFilter.push(filterMessage.author.bot);
			if (args.user) shouldFilter.push(filterMessage.author.id === args.user.id);

			return shouldFilter.filter((bool) => bool === false).length === 0 && filterMessage.id !== message.id;
		};
		const messages = new Collection(
			(await message.channel!.messages.fetch({ limit: 100, before: message.id }))
				.filter((message) => messageFilter(message))
				.first(args.amount)
				.map((m) => [m.id, m] as const)
		);

		const purged = await message.channel!.bulkDelete(messages, true).catch(() => null);
		if (!purged) return message.util.reply(`${emojis.error} Failed to purge messages.`).catch(() => null);
		else {
			this.client.emit(TanzaniteEvent.Purge, message.author, message.guild, message.channel!, messages);
			await message.util.send(`${emojis.success} Successfully purged **${purged.length}** messages.`);
			/* .then(async (purgeMessage) => {
					if (!message.util.isSlashMessage(message)) {
						await sleep(5);
						await purgeMessage.delete().catch(() => {});
					}
				}); */
		}
	}
}
