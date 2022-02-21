import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, Collection, PermissionFlagsBits, type Snowflake } from 'discord.js';

export default class PurgeCommand extends BushCommand {
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
					type: util.arg.range('integer', 1, 100, true),
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
			clientPermissions: (m) =>
				util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [PermissionFlagsBits.ManageMessages],
			channel: 'guild'
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { amount: number; bot: boolean; user: ArgType<'user'> }
	) {
		assert(message.inGuild());

		if (args.amount > 100 || args.amount < 1) return message.util.reply(`${util.emojis.error} `);

		const messageFilter = (filterMessage: BushMessage): boolean => {
			const shouldFilter: boolean[] = [];
			if (args.bot) shouldFilter.push(filterMessage.author.bot);
			if (args.user) shouldFilter.push(filterMessage.author.id === args.user.id);

			return shouldFilter.filter((bool) => bool === false).length === 0 && filterMessage.id !== message.id;
		};
		const _messages = (await message.channel.messages.fetch({ limit: 100, before: message.id }))
			.filter((message) => messageFilter(message))
			.first(args.amount);
		const messages = new Collection<Snowflake, BushMessage>(_messages.map((m) => [m.id, m]));

		const purged = await message.channel.bulkDelete(messages, true).catch(() => null);
		if (!purged) return message.util.reply(`${util.emojis.error} Failed to purge messages.`).catch(() => null);
		else {
			client.emit('bushPurge', message.author, message.guild, message.channel, messages);
			await message.util.send(`${util.emojis.success} Successfully purged **${purged.size}** messages.`);
			/* .then(async (purgeMessage) => {
					if (!message.util.isSlashMessage(message)) {
						await util.sleep(5);
						await purgeMessage.delete().catch(() => {});
					}
				}); */
		}
	}
}
