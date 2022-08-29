import {
	Arg,
	BotCommand,
	clientSendAndPermCheck,
	colors,
	emojis,
	inspect,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, Constants, EmbedBuilder, Message, PermissionFlagsBits } from 'discord.js';

export default class ViewRawCommand extends BotCommand {
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
					type: Arg.union('message', 'messageLink'),
					readableType: 'message|messageLink',
					prompt: 'What message would you like to view?',
					retry: '{error} Choose a valid message.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'channel',
					description: 'The channel that the message is in.',
					type: 'textBasedChannel',
					prompt: 'What channel is the message in?',
					retry: '{error} Choose a valid channel.',
					optional: true,
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: Constants.TextBasedChannelTypes
				},
				{
					id: 'json',
					description: 'Whether or not to view the raw JSON message data.',
					match: 'flag',
					flag: '--json',
					prompt: 'Would you like to view the raw JSON message data?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				},
				{
					id: 'js',
					description: 'Whether or not to view the raw message data.',
					match: 'flag',
					flag: '--js',
					prompt: 'Would you like to view the raw message data?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			message: ArgType<'message' | 'messageLink'>;
			channel: OptArgType<'textBasedChannel'>;
			json: ArgType<'flag'>;
			js: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());

		args.channel ??= message.channel;

		const newMessage =
			args.message instanceof Message ? args.message : await args.channel!.messages.fetch(`${args.message}`).catch(() => null);
		if (!newMessage)
			return await message.util.reply(
				`${emojis.error} There was an error fetching that message, make sure that is a valid id and if the message is not in this channel, please provide a channel.`
			);

		const Embed = await ViewRawCommand.getRawData(newMessage, { json: args.json, js: args.js });

		return await message.util.reply({ embeds: [Embed] });
	}

	public static async getRawData(message: Message, options: { json?: boolean; js: boolean }): Promise<EmbedBuilder> {
		const content =
			options.json || options.js
				? options.json
					? JSON.stringify(message.toJSON(), undefined, 2)
					: inspect(message.toJSON()) || '[No Content]'
				: message.content || '[No Content]';
		const lang = options.json ? 'json' : options.js ? 'js' : undefined;
		return new EmbedBuilder()
			.setFooter({ text: message.author.tag, iconURL: message.author.avatarURL() ?? undefined })
			.setTimestamp(message.createdTimestamp)
			.setColor(message.member?.roles?.color?.color ?? colors.default)
			.setTitle('Raw Message Information')
			.setDescription(await message.client.utils.codeblock(content, 2048, lang));
	}
}
