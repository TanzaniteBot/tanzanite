import { BushCommand, BushMessage, BushSlashMessage, guildLogsArr, GuildLogType } from '@lib';
import { ArgumentOptions, Flag } from 'discord-akairo';
import { TextChannel } from 'discord.js';

export default class LogCommand extends BushCommand {
	public constructor() {
		super('log', {
			aliases: ['log', 'logging'],
			category: 'config',
			description: {
				content: 'Set or remove a log channel.',
				usage: ['log <logType> [channel]'],
				examples: ['log automod #automod-logs']
			},
			slash: true,
			slashOptions: [
				{
					name: 'log_type',
					description: 'What log type would you like to change?',
					type: 'STRING',
					required: true,
					choices: guildLogsArr.map((log) => ({ name: log, value: log }))
				},
				{
					name: 'channel',
					description: 'What channel would you like these logs to be sent in?',
					type: 'CHANNEL',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: ['MANAGE_GUILD']
		});
	}

	override *args(): IterableIterator<ArgumentOptions | Flag> {
		const log_type = yield {
			id: 'log',
			type: guildLogsArr,
			prompt: {
				start: 'What log type would you like to change?',
				retry: `{error} Choose either ${util.oxford(
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
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { log_type: GuildLogType; channel: TextChannel }) {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be used in servers.`);
		const currentLogs = await message.guild.getSetting('logChannels');
		const oldChannel = currentLogs[args.log_type] ?? undefined;

		const action = !!args.channel;

		action ? (currentLogs[args.log_type] = args.channel.id) : delete currentLogs[args.log_type];

		const success = await message.guild.setSetting('logChannels', currentLogs, message.member!);

		return await message.util.reply(
			`${
				success
					? `${util.emojis.success} Successfully ${oldChannel ? 'changed' : 'set'}`
					: `${util.emojis.error} Unable to ${oldChannel ? 'change' : 'set'}`
			} ${
				oldChannel ? ` the **${args.log_type}** log channel from <#${oldChannel}>` : ` the \`${args.log_type}\` log channel`
			} to ${args.channel ? `<#${args.channel.id}>` : '`disabled`'}`
		);
	}
}
