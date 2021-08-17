import { DMChannel, Message, MessageEmbed, NewsChannel, Snowflake, TextChannel } from 'discord.js';
import { inspect } from 'util';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class ViewRawCommand extends BushCommand {
	public constructor() {
		super('viewraw', {
			aliases: ['viewraw'],
			category: 'utilities',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				usage: 'viewraw <message id> <channel>',
				examples: ['viewraw 322862723090219008'],
				content: 'Gives information about a specified user.'
			},
			args: [
				{
					id: 'message',
					customType: util.arg.union('message', 'bigint'),
					prompt: {
						start: 'What message would you like to view?',
						retry: '{error} Choose a valid message.',
						optional: false
					}
				},
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel is the message in?',
						retry: '{error} Choose a valid channel.',
						optional: true
					},
					default: (m: Message) => m.channel
				},
				{
					id: 'json',
					match: 'flag',
					flag: '--json'
				},
				{
					id: 'js',
					match: 'flag',
					flag: '--js'
				}
			]
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { message: Message | BigInt; channel: TextChannel | NewsChannel | DMChannel; json?: boolean; js: boolean }
	): Promise<unknown> {
		let newMessage: Message | 0;
		if (!(typeof args.message === 'object')) {
			newMessage = await args.channel.messages.fetch(`${args.message}` as Snowflake).catch(() => {
				return 0;
			});
			if (!newMessage) {
				return await message.util.reply(
					`${util.emojis.error} There was an error fetching that message, try supplying a channel.`
				);
			}
		} else {
			newMessage = args.message as Message;
		}

		const messageEmbed = await ViewRawCommand.getRawData(newMessage as BushMessage, { json: args.json, js: args.js });

		return await message.util.reply({ embeds: [messageEmbed] });
	}

	public static async getRawData(message: BushMessage, options: { json?: boolean; js: boolean }): Promise<MessageEmbed> {
		const content =
			options.json || options.js
				? options.json
					? inspect(JSON.stringify(message.toJSON()))
					: inspect(message.toJSON()) || '[No Content]'
				: message.content || '[No Content]';
		const lang = options.json ? 'json' : options.js ? 'js' : undefined;
		return (
			new MessageEmbed()
				.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }) ?? undefined)
				.setTimestamp(message.createdTimestamp)
				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				.setColor(message.member?.roles?.color?.color || util.colors.default)
				.setTitle('Raw Message Information')
				.setDescription(await util.codeblock(content, 2048, lang))
		);
	}
}
