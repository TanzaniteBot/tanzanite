import { BushCommand, BushMessage, BushSlashMessage, BushUser, ModLog } from '@lib';
import { MessageEmbed, User } from 'discord.js';

export default class ModlogCommand extends BushCommand {
	public constructor() {
		super('modlog', {
			aliases: ['modlog', 'modlogs'],
			category: 'moderation',
			description: {
				content: "View a user's modlogs, or view a specific case.",
				usage: 'modlogs <search>',
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
				}
			],
			userPermissions: ['MANAGE_MESSAGES'],
			slash: true,
			slashOptions: [
				{
					name: 'search',
					description: 'What case id or user would you like to see?',
					type: 'STRING',
					required: true
				}
			]
		});
	}

	#generateModlogInfo(log: ModLog): string {
		const trim = (str: string): string => (str.endsWith('\n') ? str.substring(0, str.length - 1).trim() : str.trim());
		const modLog = [
			`**Case ID**: ${log.id}`,
			`**Type**: ${log.type.toLowerCase()}`,
			`**User**: <@!${log.user}> (${log.user})`,
			`**Moderator**: <@!${log.moderator}> (${log.moderator})`
		];
		if (log.duration) modLog.push(`**Duration**: ${util.humanizeDuration(log.duration)}`);
		modLog.push(`**Reason**: ${trim(log.reason ?? 'No Reason Specified.')}`);
		if (log.evidence) modLog.push(`**Evidence:** ${trim(log.evidence)}`);
		return modLog.join(`\n`);
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ search }: { search: BushUser | string }
	): Promise<unknown> {
		const foundUser = search instanceof User ? search : await util.resolveUserAsync(search);
		if (foundUser) {
			const logs = await ModLog.findAll({
				where: {
					guild: message.guild!.id,
					user: foundUser.id
				},
				order: [['createdAt', 'ASC']]
			});
			if (!logs.length) return message.util.reply(`${util.emojis.error} **${foundUser.tag}** does not have any modlogs.`);
			const niceLogs: string[] = [];
			for (const log of logs) {
				niceLogs.push(this.#generateModlogInfo(log));
			}
			const chunked: string[][] = util.chunk(niceLogs, 3);
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
			if (!entry) return message.util.send(`${util.emojis.error} That modlog does not exist.`);
			const embed = new MessageEmbed({
				title: `Case ${entry.id}`,
				description: this.#generateModlogInfo(entry),
				color: util.colors.default
			});
			return await util.buttonPaginate(message, [embed]);
		}
	}
}
