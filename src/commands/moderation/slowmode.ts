import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { Argument } from 'discord-akairo';
import { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits, type TextChannel, type ThreadChannel } from 'discord.js';

export default class SlowmodeCommand extends BushCommand {
	public constructor() {
		super('slowmode', {
			aliases: ['slowmode', 'slow'],
			category: 'moderation',
			description: 'A command to set the slowmode of a channel.',
			usage: ['slowmode <length> [channel]'],
			examples: ['slowmode 3'],
			args: [
				{
					id: 'length',
					description: 'The amount of time to set the slowmode of a channel to.',
					type: Argument.union('duration', 'durationSeconds', 'off', 'none', 'disable'),
					readableType: "duration|durationSeconds|'off'|'none'|'disable'",
					prompt: 'What would you like to set the slowmode to?',
					retry: '{error} Please set the slowmode to a valid length.',
					optional: true,
					slashType: ApplicationCommandOptionType.Integer
				},
				{
					id: 'channel',
					description: 'The channel to change the slowmode of, defaults to the current channel.',
					type: 'channel',
					prompt: 'What channel would you like to change?',
					retry: '{error} Choose a valid channel.',
					optional: true,
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: [ChannelType.GuildText, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread]
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) =>
				util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.EmbedLinks], true),
			userPermissions: (m) => util.userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{
			length,
			channel
		}: {
			length: ArgType<'duration'> | ArgType<'durationSeconds'> | 'off' | 'none' | 'disable' | null;
			channel: ArgType<'channel'>;
		}
	) {
		if (message.channel!.type === ChannelType.DM)
			return await message.util.reply(`${util.emojis.error} This command cannot be run in dms.`);
		if (!channel) channel = message.channel as any;
		if (![ChannelType.GuildText, ChannelType.GuildPrivateThread, ChannelType.GuildPublicThread].includes(channel.type))
			return await message.util.reply(`${util.emojis.error} <#${channel.id}> is not a text or thread channel.`);
		if (length) {
			length =
				typeof length === 'string' && !(['off', 'none', 'disable'] as const).includes(length)
					? await util.arg.cast('duration', message, length)
					: length;
		}

		const length2: number = (['off', 'none', 'disable'] as const).includes(length as string) ? 0 : (length as number);

		const setSlowmode = await (channel as ThreadChannel | TextChannel)
			.setRateLimitPerUser(length2 / 1000, `Changed by ${message.author.tag} (${message.author.id}).`)
			.catch(() => {});
		if (!setSlowmode)
			return await message.util.reply(
				`${util.emojis.error} There was an error changing the slowmode of <#${(channel as ThreadChannel | TextChannel).id}>.`
			);
		else
			return await message.util.reply(
				`${util.emojis.success} Successfully changed the slowmode of <#${channel.id}> ${
					length2 ? `to \`${util.humanizeDuration(length2)}` : '`off'
				}\`.`
			);
	}
}
