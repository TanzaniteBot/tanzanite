import { User } from 'discord.js';
import { Guild } from '../../lib/models';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { Ban, Modlog, ModlogType } from '../../lib/models';
import moment from 'moment';
import { Message } from 'discord.js';
import { CommandInteraction } from 'discord.js';
// import { SlashCommandOption } from '../../lib/extensions/Util';
// import { ApplicationCommandOptionType } from 'discord-api-types';

const durationAliases: Record<string, string[]> = {
	weeks: ['w', 'weeks', 'week', 'wk', 'wks'],
	days: ['d', 'days', 'day'],
	hours: ['h', 'hours', 'hour', 'hr', 'hrs'],
	minutes: ['m', 'min', 'mins', 'minutes', 'minute'],
	months: ['mo', 'month', 'months']
};
const durationRegex =
	/(?:(\d+)(d(?:ays?)?|h(?:ours?|rs?)?|m(?:inutes?|ins?)?|mo(?:nths?)?|w(?:eeks?|ks?)?)(?: |$))/g;

export default class PrefixCommand extends BotCommand {
	constructor() {
		super('ban', {
			aliases: ['ban'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to ban?',
						retry: 'Invalid response. What user would you like to ban?'
					}
				},
				{
					id: 'reason',
					match: 'rest'
				},
				{
					id: 'time',
					match: 'option',
					flag: '--time'
				}
			],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			description: {
				content:
					'Ban a member and log it in modlogs (with optional time to unban)',
				usage: 'ban <member> <reason> [--time]',
				examples: [
					'ban @Tyman being cool',
					'ban @Tyman being cool --time 7days'
				]
			}
			// slashCommandOptions: [
			// 	{
			// 		type: ApplicationCommandOptionType.USER,
			// 		name: 'user',
			// 		description: 'The user to ban',
			// 		required: true
			// 	},
			// 	{
			// 		type: ApplicationCommandOptionType.STRING,
			// 		name: 'reason',
			// 		description: 'The reason to show in modlogs and audit log',
			// 		required: false
			// 	},
			// 	{
			// 		type: ApplicationCommandOptionType.STRING,
			// 		name: 'time',
			// 		description:
			// 			'The time the user should be banned for (default permanent)',
			// 		required: false
			// 	}
			// ]
		});
	}
	async *genResponses(
		message: Message | CommandInteraction,
		user: User,
		reason?: string,
		time?: string
	): AsyncIterable<string> {
		const duration = moment.duration();
		let modlogEnry: Modlog;
		let banEntry: Ban;
		const translatedTime: string[] = [];
		// Create guild entry so postgres doesn't get mad when I try and add a modlog entry
		await Guild.findOrCreate({
			where: {
				id: message.guild.id
			},
			defaults: {
				id: message.guild.id
			}
		});
		try {
			try {
				if (time) {
					const parsed = [...time.matchAll(durationRegex)];
					if (parsed.length < 1) {
						yield 'Invalid time.';
						return;
					}
					for (const part of parsed) {
						const translated = Object.keys(durationAliases).find((k) =>
							durationAliases[k].includes(part[2])
						);
						translatedTime.push(part[1] + ' ' + translated);
						duration.add(
							Number(part[1]),
							translated as 'weeks' | 'days' | 'hours' | 'months' | 'minutes'
						);
					}
					modlogEnry = Modlog.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						type: ModlogType.TEMPBAN,
						duration: duration.asMilliseconds(),
						moderator:
							message instanceof CommandInteraction
								? message.user.id
								: message.author.id
					});
					banEntry = Ban.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						expires: new Date(new Date().getTime() + duration.asMilliseconds()),
						modlog: modlogEnry.id
					});
				} else {
					modlogEnry = Modlog.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						type: ModlogType.BAN,
						moderator:
							message instanceof CommandInteraction
								? message.user.id
								: message.author.id
					});
					banEntry = Ban.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						modlog: modlogEnry.id
					});
				}
				await modlogEnry.save();
				await banEntry.save();
			} catch (e) {
				console.error(e);
				yield 'Error saving to database. Please report this to a developer.';
				return;
			}
			try {
				await user.send(
					`You were banned in ${message.guild.name} ${
						translatedTime.length >= 1
							? `for ${translatedTime.join(', ')}`
							: 'permanently'
					} with reason \`${reason || 'No reason given'}\``
				);
			} catch (e) {
				yield 'Error sending message to user';
			}
			await message.guild.members.ban(user, {
				reason: `Banned by ${
					message instanceof CommandInteraction
						? message.user.tag
						: message.author.tag
				} with ${reason ? `reason ${reason}` : 'no reason'}`
			});
			yield `Banned <@!${user.id}> ${
				translatedTime.length >= 1
					? `for ${translatedTime.join(', ')}`
					: 'permanently'
			} with reason \`${reason || 'No reason given'}\``;
		} catch {
			yield 'Error banning :/';
			await banEntry.destroy();
			await modlogEnry.destroy();
			return;
		}
	}
	async exec(
		message: Message,
		{ user, reason, time }: { user: User; reason?: string; time?: string }
	): Promise<void> {
		for await (const response of this.genResponses(
			message,
			user,
			reason,
			time
		)) {
			await message.util.send(response);
		}
	}

	// async execSlash(
	// 	message: CommandInteraction,
	// 	{
	// 		user,
	// 		reason,
	// 		time
	// 	}: {
	// 		user: SlashCommandOption<undefined>;
	// 		reason: SlashCommandOption<string>;
	// 		time: SlashCommandOption<string>;
	// 	}
	// ): Promise<void> {
	// 	for await (const response of this.genResponses(
	// 		message,
	// 		user.user,
	// 		reason?.value,
	// 		time?.value
	// 	)) {
	// 		await message.reply(response);
	// 	}
	// }
}
