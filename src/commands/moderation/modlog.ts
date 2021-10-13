import { BushCommand, BushMessage, BushSlashMessage, BushUser, ModLog } from '@lib';
import { MessageEmbed, User } from 'discord.js';

export default class ModlogCommand extends BushCommand {
	public constructor() {
		super('modlog', {
			aliases: ['modlog', 'modlogs'],
			category: 'moderation',
			description: {
				content: "View a user's modlogs, or view a specific case.",
				usage: 'modlogs <search> [--hidden]',
				examples: ['modlogs @Tyman']
			},
			args: [
				{
					id: 'search',
					customType: util.arg.union('user', 'string'),
					prompt: {
						start: 'What case id or user would you like to see?',
						retry: '{error} Choose a valid case id or user.'
					}
				},
				{
					id: 'hidden',
					match: 'flag',
					flag: ['--hidden', '-h'],
					default: false
				}
			],
			userPermissions: [],
			slash: true,
			slashOptions: [
				{
					name: 'search',
					description: 'What case id or user would you like to see?',
					type: 'STRING',
					required: true
				},
				{
					name: 'hidden',
					description: 'Would you like to see hidden modlogs?',
					type: 'BOOLEAN',
					required: false
				}
			]
		});
	}

	#generateModlogInfo(log: ModLog, showUser: boolean): string {
		const trim = (str: string): string => (str.endsWith('\n') ? str.substring(0, str.length - 1).trim() : str.trim());
		const modLog = [`**Case ID**: ${util.discord.escapeItalic(log.id)}`, `**Type**: ${log.type.toLowerCase()}`];
		if (showUser) modLog.push(`**User**: <@!${log.user}>`);
		modLog.push(`**Moderator**: <@!${log.moderator}>`);
		if (log.duration) modLog.push(`**Duration**: ${util.humanizeDuration(log.duration)}`);
		modLog.push(`**Reason**: ${trim(log.reason ?? 'No Reason Specified.')}`);
		modLog.push(`**Date**: ${util.timestamp(log.createdAt)}`);
		if (log.evidence) modLog.push(`**Evidence:** ${trim(log.evidence)}`);
		return modLog.join(`\n`);
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ search, hidden }: { search: BushUser | string; hidden: boolean }
	): Promise<unknown> {
		if (!message.member?.permissions.has('MANAGE_MESSAGES'))
			return await message.util.reply(
				`${util.emojis.error} You must have the **Manage Message** permission to use this command.`
			);
		const foundUser = search instanceof User ? search : await util.resolveUserAsync(search);
		if (foundUser) {
			const logs = await ModLog.findAll({
				where: {
					guild: message.guild!.id,
					user: foundUser.id
				},
				order: [['createdAt', 'ASC']]
			});
			const niceLogs = logs
				.filter((log) => !log.pseudo)
				.filter((log) => !(log.hidden && hidden))
				.map((log) => this.#generateModlogInfo(log, false));
			if (!logs.length || !niceLogs.length)
				return message.util.reply(`${util.emojis.error} **${foundUser.tag}** does not have any modlogs.`);
			const chunked: string[][] = util.chunk(niceLogs, 4);
			const embedPages = chunked.map(
				(chunk) =>
					new MessageEmbed({
						title: `${foundUser.tag}'s Mod Logs`,
						description: chunk.join('\n━━━━━━━━━━━━━━━\n'),
						color: util.colors.default
					})
			);
			return await util.buttonPaginate(message, embedPages, undefined, true);
		} else if (search) {
			const entry = await ModLog.findByPk(search as string);
			if (!entry || entry.pseudo || (entry.hidden && !hidden))
				return message.util.send(`${util.emojis.error} That modlog does not exist.`);
			if (entry.guild !== message.guild!.id)
				return message.util.reply(`${util.emojis.error} This modlog is from another server.`);
			const embed = {
				title: `Case ${entry.id}`,
				description: this.#generateModlogInfo(entry, true),
				color: util.colors.default
			};
			return await util.buttonPaginate(message, [embed]);
		}
	}
}
