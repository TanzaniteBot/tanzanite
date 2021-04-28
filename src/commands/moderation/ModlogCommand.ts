import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message } from 'discord.js';
import { Modlog } from '../../lib/types/Models';
import { MessageEmbed } from 'discord.js';
import moment from 'moment';
import { stripIndent } from 'common-tags';
import { Argument } from 'discord-akairo';

export default class ModlogCommand extends BotCommand {
	constructor() {
		super('modlog', {
			aliases: ['modlog', 'modlogs'],
			args: [
				{
					id: 'search',
					prompt: {
						start: 'What modlog id or user would you like to see?'
					}
				},
				{
					id: 'page',
					type: 'number'
				}
			],
			userPermissions: ['MANAGE_MESSAGES']
		});
	}
	*args(): unknown {
		const search = yield {
			id: 'search',
			type: Argument.union('user', 'string'),
			prompt: {
				start: 'What modlog id or user would you like to see?'
			}
		};
		if (typeof search === 'string') return { search, page: null };
		else {
			const page = yield {
				id: 'page',
				type: 'number',
				prompt: {
					start: 'What page?',
					retry: 'Not a number. What page?',
					optional: true
				}
			};
			return { search, page };
		}
	}
	async exec(
		message: Message,
		{ search, page }: { search: string; page: number }
	): Promise<void> {
		const foundUser = await this.client.util.resolveUserAsync(search);
		if (foundUser) {
			const logs = await Modlog.findAll({
				where: {
					guild: message.guild.id,
					user: foundUser.id
				},
				order: [['createdAt', 'ASC']]
			});
			const niceLogs: string[] = [];
			for (const log of logs) {
				niceLogs.push(stripIndent`
					ID: ${log.id}
					Type: ${log.type.toLowerCase()}
					User: <@!${log.user}> (${log.user})
					Moderator: <@!${log.moderator}> (${log.moderator})
					Duration: ${
						log.duration
							? moment.duration(log.duration, 'milliseconds').humanize()
							: 'N/A'
					}
					Reason: ${log.reason || 'None given'}
					${this.client.util.ordinal(logs.indexOf(log) + 1)} action
				`);
			}
			const chunked: string[][] = this.client.util.chunk(niceLogs, 3);
			const embedPages = chunked.map(
				(e, i) =>
					new MessageEmbed({
						title: `Modlogs page ${i + 1}`,
						description: e.join(
							'\n-------------------------------------------------------\n'
						),
						footer: {
							text: `Page ${i + 1}/${chunked.length}`
						}
					})
			);
			if (page) {
				await message.util.send(embedPages[page - 1]);
				return;
			} else {
				await message.util.send(embedPages[0]);
				return;
			}
		} else if (search) {
			const entry = await Modlog.findByPk(search);
			if (!entry) {
				await message.util.send('That modlog does not exist.');
				return;
			}
			await message.util.send(
				new MessageEmbed({
					title: `Modlog ${entry.id}`,
					fields: [
						{
							name: 'Type',
							value: entry.type.toLowerCase(),
							inline: true
						},
						{
							name: 'Duration',
							value: `${
								entry.duration
									? moment.duration(entry.duration, 'milliseconds').humanize()
									: 'N/A'
							}`,
							inline: true
						},
						{
							name: 'Reason',
							value: `${entry.reason || 'None given'}`,
							inline: true
						},
						{
							name: 'Moderator',
							value: `<@!${entry.moderator}> (${entry.moderator})`,
							inline: true
						},
						{
							name: 'User',
							value: `<@!${entry.user}> (${entry.user})`,
							inline: true
						}
					]
				})
			);
		}
	}
}
