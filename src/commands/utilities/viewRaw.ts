import {
	Arg,
	BotCommand,
	colors,
	emojis,
	GuildTextBasedChannelTypes,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { messageLinkRaw } from '#lib/arguments/messageLinkRaw.js';
import { snowflake } from '#lib/arguments/snowflake.js';
import { rawCreatedTimestamp, rawDisplayAvatarURL, rawTag } from '#lib/utils/RawUtils.js';
import { APIMessage, ApplicationCommandOptionType, Client, EmbedBuilder, Routes, Snowflake } from 'discord.js';
import assert from 'node:assert/strict';

export default class ViewRawCommand extends BotCommand {
	public constructor() {
		super('view-raw', {
			aliases: ['view-raw', 'vr'],
			category: 'utilities',
			description: 'Shows raw information about a message.',
			usage: ['viewraw <messageId> <channel> [--json]', 'viewraw <messageURL> [--json]'],
			examples: [
				'viewraw 832652662436397058 832652653292027904',
				'vr https://discord.com/channels/516977525906341928/832652653292027904/832652836655071268 --json'
			],
			args: [
				{
					id: 'message',
					description: 'The message to view the raw content of.',
					type: Arg.union('messageLinkRaw', 'snowflake'),
					readableType: 'messageLink|messageId',
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
					channelTypes: GuildTextBasedChannelTypes
				},
				{
					id: 'json',
					description: 'Whether or not to view the raw JSON message data.',
					match: 'flag',
					flag: '--json',
					prompt: 'Would you like to view the raw JSON message data?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			message: ArgType<'snowflake' | 'messageLinkRaw'>;
			channel: OptArgType<'textBasedChannel'>;
			json: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());

		let parsed: { channelId: Snowflake; messageId: Snowflake };
		if (typeof args.message === 'string') {
			const rawLink = messageLinkRaw(<any>{}, args.message);
			if (rawLink) {
				parsed = { channelId: rawLink.channel_id, messageId: rawLink.message_id };
			} else {
				args.channel ??= message.channel;

				if (!args.channel) {
					return message.util.reply(`${emojis.error} Unable to use this channel.`);
				} else if (!args.channel.isTextBased()) {
					return message.util.reply(`${emojis.error} Non text-based channel provided.`);
				}

				const msgId = snowflake(<any>{}, args.message);
				if (msgId) {
					parsed = { channelId: args.channel.id, messageId: msgId };
				} else {
					return message.util.reply(`${emojis.error} Unable to parse the message ID.`);
				}
			}
		} else {
			parsed = { channelId: args.message.channel_id, messageId: args.message.message_id };
		}

		if (!parsed || !parsed.channelId || !parsed.messageId) {
			return message.util.reply(`${emojis.error} Unable to parse message information :(.`);
		}

		const rawMsg = <APIMessage | null>(
			await this.client.rest.get(Routes.channelMessage(parsed.channelId, parsed.messageId)).catch(() => null)
		);

		if (!rawMsg) {
			return await message.util.reply(
				`${emojis.error} There was an error fetching that message, make sure that is a valid id and if the message is not in this channel, please provide a channel.`
			);
		}

		const Embed = await getRawData(this.client, rawMsg, args.json);

		return await message.util.reply({ embeds: [Embed] });
	}
}

export async function getRawData(client: Client, message: APIMessage, json = false): Promise<EmbedBuilder> {
	const content = json ? JSON.stringify(message, undefined, 2) : message.content || '[No Content]';

	const resolvedMember = () => {
		const channel = client.channels.resolve(message.channel_id);

		if (!channel || channel.isDMBased()) return null;

		return channel.guild.members.resolve(message.author.id) ?? null;
	};

	return new EmbedBuilder()
		.setFooter({ text: rawTag(message.author), iconURL: rawDisplayAvatarURL(client.rest, message.author) })
		.setTimestamp(rawCreatedTimestamp(message))
		.setColor(resolvedMember()?.roles.color?.color ?? colors.default)
		.setTitle('Raw Message Information')
		.setDescription(await client.utils.codeblock(content, 2048, json ? 'json' : undefined));
}
