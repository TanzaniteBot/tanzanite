import { Arg, BotCommand, emojis, format, humanizeDuration, type CommandMessage, type OptArgType, type SlashMessage } from '#lib';
import { Argument } from '@notenoughupdates/discord-akairo';
import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import assert from 'node:assert/strict';

export default class SlowmodeCommand extends BotCommand {
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
					channelTypes: [ChannelType.GuildText, ChannelType.PrivateThread, ChannelType.PublicThread]
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ManageChannels', 'EmbedLinks'],
			userPermissions: ['ManageMessages']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			length: OptArgType<'duration' | 'durationSeconds'> | 'off' | 'none' | 'disable';
			channel: OptArgType<'channel'>;
		}
	) {
		assert(message.inGuild());

		args.channel ??= message.channel!;

		assert(args.channel);

		if (
			args.channel.type !== ChannelType.GuildText &&
			args.channel.type !== ChannelType.GuildAnnouncement &&
			args.channel.type !== ChannelType.GuildVoice &&
			!args.channel.isThread()
		)
			return await message.util.reply(`${emojis.error} <#${args.channel.id}> is not a text or thread channel.`);

		args.length =
			typeof args.length === 'string' && !(['off', 'none', 'disable'] as const).includes(args.length)
				? await Arg.cast('duration', message, args.length)
				: args.length;

		const length2: number = (['off', 'none', 'disable'] as const).includes(args.length) || args.length === null ? 0 : args.length;

		const setSlowmode = await args.channel
			.setRateLimitPerUser(length2 / 1000, `Changed by ${message.author.tag} (${message.author.id}).`)
			.catch(() => {});
		if (!setSlowmode)
			return await message.util.reply(`${emojis.error} There was an error changing the slowmode of <#${args.channel.id}>.`);
		else
			return await message.util.reply(
				`${emojis.success} Successfully changed the slowmode of <#${args.channel.id}> ${
					length2 ? `to ${format.input(humanizeDuration(length2))}` : '**off**'
				}.`
			);
	}
}
