import {
	Arg,
	BotCommand,
	ButtonPaginator,
	ModLog,
	chunk,
	colors,
	emojis,
	humanizeDuration,
	timestamp,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { embedField } from '#lib/common/tags.js';
import { ApplicationCommandOptionType, User, escapeMarkdown } from 'discord.js';
import assert from 'node:assert/strict';

export default class ModlogCommand extends BotCommand {
	public constructor() {
		super('modlog', {
			aliases: ['modlog', 'modlogs'],
			category: 'moderation',
			description: "View a user's modlogs, or view a specific case.",
			usage: ['modlogs <search> [--hidden]'],
			examples: ['modlogs @Tyman'],
			args: [
				{
					id: 'search',
					description: 'The case id or user to search for modlogs by.',
					type: Arg.union('user', 'string'),
					prompt: 'What case id or user would you like to see?',
					retry: '{error} Choose a valid case id or user.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'hidden',
					description: 'Show hidden modlogs.',
					prompt: 'Would you like to see hidden modlogs?',
					match: 'flag',
					flag: ['--hidden', '-h'],
					optional: true,
					slashType: ApplicationCommandOptionType.Boolean
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: [],
			userPermissions: ['ManageMessages']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{ search, hidden = false }: { search: ArgType<'user'> | string; hidden: ArgType<'flag'> }
	) {
		assert(message.inGuild());

		const foundUser = search instanceof User ? search : await this.client.utils.resolveUserAsync(search);
		if (foundUser) {
			const logs = await ModLog.findAll({
				where: {
					guild: message.guild.id,
					user: foundUser.id,
					pseudo: false
				},
				order: [['createdAt', 'ASC']]
			});
			const niceLogs = logs.filter((log) => !log.hidden || hidden).map((log) => generateModlogInfo(log, false, false));

			if (niceLogs.length < 1) {
				return message.util.reply(`${emojis.error} **${foundUser.tag}** does not have any modlogs.`);
			}

			const chunked: string[][] = chunk(niceLogs, 4);
			const embedPages = chunked.map((chunk) => ({
				title: `${foundUser.tag}'s Modlogs`,
				description: chunk.join(modlogSeparator),
				color: colors.default
			}));
			return await ButtonPaginator.send(message, embedPages, undefined, true);
		} else {
			const entry = await ModLog.findByPk(search as string);

			if (!entry || entry.pseudo || (entry.hidden && !hidden)) {
				return message.util.send(`${emojis.error} That modlog does not exist.`);
			}

			if (entry.guild !== message.guild.id) {
				return message.util.reply(`${emojis.error} This modlog is from another server.`);
			}

			const embed = {
				title: `Case ${entry.id}`,
				description: generateModlogInfo(entry, true, false),
				color: colors.default
			};
			return await ButtonPaginator.send(message, [embed]);
		}
	}
}

export const modlogSeparator = '\n━━━━━━━━━━━━━━━\n';

const trim = (str: string): string => {
	if (str.endsWith('\n')) {
		return str.substring(0, str.length - 1).trim();
	} else {
		return str.trim();
	}
};

export function generateModlogInfo(log: ModLog, showUser: boolean, userFacing: boolean): string {
	/* eslint-disable @typescript-eslint/strict-boolean-expressions */
	return embedField`
		Case ID ${escapeMarkdown(log.id)}
		Type ${log.type.toLowerCase()}
		User ${showUser && `<@!${log.user}>`}
		Moderator ${!userFacing && `<@!${log.moderator}>`}
		Duration ${log.duration && humanizeDuration(log.duration)}
		Reason ${trim(log.reason ?? 'No Reason Specified.')}
		Date ${timestamp(log.createdAt)}
		Evidence ${log.evidence && !userFacing && trim(log.evidence)}`;
	/* eslint-enable  @typescript-eslint/strict-boolean-expressions */
}
