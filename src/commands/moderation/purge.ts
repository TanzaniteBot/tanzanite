import { Collection, Snowflake } from 'discord.js';
import { BushCommand, BushMessage } from '../../lib';

export default class PurgeCommand extends BushCommand {
	public constructor() {
		super('purge', {
			aliases: ['purge'],
			category: 'moderation',
			description: {
				content: 'A command to mass delete messages.',
				usage: 'purge <amount>',
				examples: ['Purge 20']
			},
			args: [
				{
					id: 'amount',
					customType: util.arg.range('integer', 1, 100, true),
					prompt: {
						start: 'How many messages would you like to purge?',
						retry: '{error} Please pick a number between 1 and 100.'
					}
				},
				{
					id: 'bot',
					match: 'flag',
					flag: '--bot'
				},
				{ id: 'user', match: 'option', flag: '--user' }
			],
			slash: true,
			slashOptions: [
				{ name: 'amount', description: 'How many messages would you like to purge?', type: 'INTEGER', required: true },
				{
					name: 'bot',
					description: 'Would you like to only delete messages that are from bots?',
					type: 'BOOLEAN',
					required: false
				}
			],
			clientPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES'],
			channel: 'guild'
		});
	}

	public override async exec(message: BushMessage, args: { amount: number; bot: boolean }): Promise<unknown> {
		if (message.channel.type === 'DM') return message.util.reply(`${util.emojis.error} You cannot run this command in dms.`);
		if (args.amount > 100 || args.amount < 1) return message.util.reply(`${util.emojis.error} `);

		const messageFilter = (filterMessage: BushMessage): boolean => {
			const shouldFilter = new Array<boolean>();
			if (args.bot) {
				shouldFilter.push(filterMessage.author.bot);
			}
			return shouldFilter.filter((bool) => bool === false).length === 0 && filterMessage.id !== message.id;
		};
		const _messages = (await message.channel.messages.fetch({ limit: 100, before: message.id }))
			.filter((message) => messageFilter(message))
			.first(args.amount);
		const messages = new Collection<Snowflake, BushMessage>();
		_messages.forEach((m) => messages.set(m.id, m));

		const purged = await message.channel.bulkDelete(messages, true).catch(() => null);
		if (!purged) return message.util.reply(`${util.emojis.error} Failed to purge messages.`).catch(() => null);
		else {
			client.emit('bushPurge', message.author, message.guild!, message.channel, messages);
			await message.util.send(`${util.emojis.success} Successfully purged **${purged.size}** messages.`);
			/* .then(async (purgeMessage) => {
					if (!message.util.isSlash) {
						await util.sleep(5);
						await (purgeMessage as Message).delete().catch(() => {});
					}
				}); */
		}
	}
}
