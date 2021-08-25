import { DMChannel, MessageEmbed, NewsChannel, Snowflake, TextChannel } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class ViewRawCommand extends BushCommand {
	public constructor() {
		super('viewraw', {
			aliases: ['viewraw'],
			category: 'utilities',
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			description: {
				usage: 'viewraw <message id> <channel>',
				examples: ['viewraw 322862723090219008'],
				content: 'Shows raw information about a message.'
			},
			args: [
				{
					id: 'message',
					type: 'snowflake',
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
					}
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
		args: { message: Snowflake; channel: TextChannel | NewsChannel | DMChannel; json?: boolean; js: boolean }
	): Promise<unknown> {
		if (!args.channel) args.channel = (message.channel as TextChannel | NewsChannel | DMChannel)!;
		const newMessage = await args.channel.messages.fetch(`${args.message}` as Snowflake).catch(() => null);
		if (!newMessage)
			return await message.util.reply(
				`${util.emojis.error} There was an error fetching that message, make sure that is a valid id and if the message is not in this channel, please provide a channel.`
			);

		const messageEmbed = await ViewRawCommand.getRawData(newMessage as BushMessage, { json: args.json, js: args.js });

		return await message.util.reply({ embeds: [messageEmbed] });
	}

	public static async getRawData(message: BushMessage, options: { json?: boolean; js: boolean }): Promise<MessageEmbed> {
		const content =
			options.json || options.js
				? options.json
					? JSON.stringify(message.toJSON(), undefined, 2)
					: util.inspect(message.toJSON()) || '[No Content]'
				: message.content || '[No Content]';
		const lang = options.json ? 'json' : options.js ? 'js' : undefined;
		return new MessageEmbed()
			.setFooter(message.author.tag, message.author.avatarURL({ dynamic: true }) ?? undefined)
			.setTimestamp(message.createdTimestamp)
			.setColor(message.member?.roles?.color?.color ?? util.colors.default)
			.setTitle('Raw Message Information')
			.setDescription(await util.codeblock(content, 2048, lang));
	}
}
