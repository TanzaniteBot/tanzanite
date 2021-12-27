import {
	ArgType,
	BushCommand,
	BushNewsChannel,
	BushTextChannel,
	OptionalArgType,
	type BushMessage,
	type BushSlashMessage
} from '#lib';
import { Message, MessageEmbed, type Snowflake } from 'discord.js';

export default class ViewRawCommand extends BushCommand {
	public constructor() {
		super('view-raw', {
			aliases: ['view-raw', 'vr'],
			category: 'utilities',
			description: 'Shows raw information about a message.',
			usage: ['viewraw <message id> <channel>'],
			examples: ['viewraw 322862723090219008'],
			args: [
				{
					id: 'message',
					description: 'The message to view the raw content of.',
					type: util.arg.union('guildMessage', 'messageLink'),
					readableType: 'guildMessage|messageLink',
					prompt: 'What message would you like to view?',
					retry: '{error} Choose a valid message.',
					slashType: 'STRING'
				},
				{
					id: 'channel',
					description: 'The channel that the message is in.',
					type: util.arg.union('textChannel', 'newsChannel'),
					prompt: 'What channel is the message in?',
					retry: '{error} Choose a valid channel.',
					optional: true,
					slashType: 'CHANNEL',
					channelTypes: util.discordConstants.TextBasedChannelTypes
				},
				{
					id: 'json',
					description: 'Whether or not to view the raw JSON message data.',
					match: 'flag',
					flag: '--json',
					prompt: 'Would you like to view the raw JSON message data?',
					slashType: 'BOOLEAN',
					optional: true
				},
				{
					id: 'js',
					description: 'Whether or not to view the raw message data.',
					match: 'flag',
					flag: '--js',
					prompt: 'Would you like to view the raw message data?',
					slashType: 'BOOLEAN',
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			message: ArgType<'guildMessage'> | ArgType<'messageLink'>;
			channel: OptionalArgType<'textChannel'> | OptionalArgType<'newsChannel'>;
			json: boolean;
			js: boolean;
		}
	) {
		if (!args.channel) args.channel = (message.channel as BushTextChannel | BushNewsChannel)!;
		const newMessage =
			args.message instanceof Message
				? args.message
				: await args.channel.messages.fetch(`${args.message}` as Snowflake).catch(() => null);
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
