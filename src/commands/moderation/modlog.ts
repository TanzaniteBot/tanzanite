import { Argument } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';
import { ModLog } from '../../lib/models';

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
					type: Argument.union('user', 'string'),
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

	private generateModlogInfo(log: ModLog) {
		const modLog = [
			`**Case ID**: ${log.id}`,
			`**Type**: ${log.type.toLowerCase()}`,
			`**User**: <@!${log.user}> (${log.user})`,
			`**Moderator**: <@!${log.moderator}> (${log.moderator})`
		];
		if (log.duration) modLog.push(`**Duration**: ${moment.duration(log.duration, 'milliseconds').humanize()}`);
		modLog.push(`**Reason**: ${log.reason || 'No Reason Specified.'}`);
		return modLog.join(`\n`);
	}

	async exec(message: BushMessage, { search }: { search: string }): Promise<unknown> {
		const foundUser = await this.client.util.resolveUserAsync(search);
		if (foundUser) {
			const logs = await ModLog.findAll({
				where: {
					guild: message.guild.id,
					user: foundUser.id
				},
				order: [['createdAt', 'ASC']]
			});
			const niceLogs: string[] = [];
			for (const log of logs) {
				niceLogs.push(this.generateModlogInfo(log));
			}
			const chunked: string[][] = this.client.util.chunk(niceLogs, 3);
			const embedPages = chunked.map(
				(chunk) =>
					new MessageEmbed({
						title: `${foundUser.tag}'s Mod Logs`,
						description: chunk.join('\n**―――――――――――――――――――――――――――**\n'),
						color: this.client.util.colors.default
					})
			);
			this.client.util.buttonPaginate(message, embedPages, '', true);
		} else if (search) {
			const entry = await ModLog.findByPk(search);
			if (!entry) return message.util.send(`${this.client.util.emojis.error} That modlog does not exist.`);
			const embed = new MessageEmbed({
				title: `Case ${entry.id}`,
				description: this.generateModlogInfo(entry),
				color: this.client.util.colors.default
			});
			return await this.client.util.buttonPaginate(message, [embed]);
		}
	}
}
