import {
	BotCommand,
	emojis,
	formatList,
	guildLogsArr,
	type ArgType,
	type CommandMessage,
	type GuildLogType,
	type SlashMessage
} from '#lib';
import type { ArgumentGeneratorReturn } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, ChannelType } from 'discord.js';
import assert from 'node:assert/strict';

export default class LogCommand extends BotCommand {
	public constructor() {
		super('log', {
			aliases: ['log', 'logging'],
			category: 'config',
			description: 'Set or remove a log channel.',
			usage: ['log <logType> [channel]'],
			examples: ['log automod #automod-logs'],
			slash: true,
			args: [
				{
					id: 'log_type',
					description: 'The log type to change.',
					prompt: 'What log type would you like to change?',
					slashType: ApplicationCommandOptionType.String,
					choices: guildLogsArr.map((log) => ({ name: log, value: log })),
					only: 'slash'
				},
				{
					id: 'channel',
					description: 'The channel to have logs of the selected type to be sent in.',
					type: 'channel',
					prompt: 'What channel would you like these logs to be sent in?',
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: [
						ChannelType.GuildText,
						ChannelType.GuildAnnouncement,
						ChannelType.AnnouncementThread,
						ChannelType.PublicThread,
						ChannelType.PrivateThread
					],
					only: 'slash'
				}
			],
			channel: 'guild',
			clientPermissions: [],
			userPermissions: ['ManageGuild']
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		/* eslint-disable @typescript-eslint/no-unsafe-assignment */

		const log_type = yield {
			id: 'log_type',
			type: guildLogsArr,
			prompt: {
				start: 'What log type would you like to change?',
				retry: `{error} Choose either ${formatList(
					guildLogsArr.map((l) => `\`${l}\``),
					'or'
				)}`,
				optional: false
			}
		};

		const channel = yield {
			id: 'channel',
			type: 'textChannel',
			prompt: {
				start: `What channel would you like ${log_type} logs to be sent in?`,
				retry: `{error} Choose a valid text channel for ${log_type} logs to be sent in.`
			}
		};

		return { log_type, channel };

		/* eslint-enable @typescript-eslint/no-unsafe-assignment */
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { log_type: GuildLogType; channel: ArgType<'textChannel'> }
	) {
		assert(message.inGuild());

		const currentLogs = await message.guild.getSetting('logChannels');
		const oldChannel = currentLogs[args.log_type] ?? undefined;

		const action = !!args.channel;

		action ? (currentLogs[args.log_type] = args.channel.id) : delete currentLogs[args.log_type];

		const success = await message.guild.setSetting('logChannels', currentLogs, message.member!);

		return await message.util.reply(
			`${
				success
					? `${emojis.success} Successfully ${oldChannel ? 'changed' : 'set'}`
					: `${emojis.error} Unable to ${oldChannel ? 'change' : 'set'}`
			} ${
				oldChannel ? `the **${args.log_type}** log channel from <#${oldChannel}>` : `the **${args.log_type}** log channel`
			} to ${args.channel ? `<#${args.channel.id}>` : '`disabled`'}`
		);
	}
}
