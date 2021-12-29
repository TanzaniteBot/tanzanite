import { BushCommand, guildLogsArr, type ArgType, type BushMessage, type BushSlashMessage, type GuildLogType } from '#lib';
import { type ArgumentOptions, type Flag } from 'discord-akairo';

export default class LogCommand extends BushCommand {
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
					slashType: 'STRING',
					choices: guildLogsArr.map((log) => ({ name: log, value: log })),
					only: 'slash'
				},
				{
					id: 'channel',
					description: 'The channel to have logs of the selected type to be sent in.',
					type: 'channel',
					prompt: 'What channel would you like these logs to be sent in?',
					slashType: 'CHANNEL',
					channelTypes: ['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
					only: 'slash'
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: ['MANAGE_GUILD']
		});
	}

	public override *args(): IterableIterator<ArgumentOptions | Flag> {
		const log_type = yield {
			id: 'log_type',
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

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { log_type: GuildLogType; channel: ArgType<'textChannel'> }
	) {
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
