import {
	BushCommand,
	ButtonPaginator,
	chunk,
	clientSendAndPermCheck,
	colors,
	emojis,
	ModLog,
	OptArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';

import { ApplicationCommandOptionType } from 'discord.js';
import { input, sanitizeInputForDiscord } from '../../../lib/utils/Format.js';
import ModlogCommand from './modlog.js';
export default class MyLogsCommand extends BushCommand {
	public constructor() {
		super('myLogs', {
			aliases: ['my-logs', 'my-log', 'my-modlogs', 'my-modlog'],
			category: 'moderation',
			description: 'Displays your own moderation logs.',
			usage: ['my-logs [server]'],
			examples: ['my-logs', 'my-logs 516977525906341928'],
			args: [
				{
					id: 'server',
					description: 'The server to get your mod logs from.',
					type: 'guild',
					prompt: 'What server would you like to view your mod logs from?',
					retry: '{error} Choose a valid server to view your modlogs from.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			channel: null,
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { server: OptArgType<'guild'> }) {
		const guild = args.server ?? message.guild;

		if (!guild) {
			return message.util!.send(`${emojis.error} When in DMs, you must provide a server to view your modlogs in.`);
		}

		const logs = await ModLog.findAll({
			where: {
				guild: guild.id,
				user: message.author.id
			},
			order: [['createdAt', 'ASC']]
		});

		const niceLogs = logs
			.filter((log) => !log.pseudo && !log.hidden)
			.map((log) => ModlogCommand.generateModlogInfo(log, false, true));

		if (niceLogs.length < 1) return message.util.reply(`${emojis.error} You don't have any modlogs in ${input(guild.name)}.`);

		const chunked: string[][] = chunk(niceLogs, 4);

		const embedPages = chunked.map((chunk) => ({
			title: `Your Modlogs in ${sanitizeInputForDiscord(guild.name)}`,
			description: chunk.join(ModlogCommand.separator),
			color: colors.default
		}));

		return await ButtonPaginator.send(message, embedPages, undefined, true);
	}
}
