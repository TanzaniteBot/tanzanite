import { User } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotMessage } from '../../lib/extensions/BotMessage';
import { Ban, Modlog, ModlogType } from '../../lib/types/Models';
import moment from 'moment';

const durationAliases: Record<string, string[]> = {
	weeks: ['w', 'weeks', 'week', 'wk', 'wks'],
	days: ['d', 'days', 'day'],
	hours: ['h', 'hours', 'hour', 'hr', 'hrs'],
	minutes: ['m', 'min', 'mins', 'minutes', 'minute'],
	months: ['mo', 'month', 'months']
};
const durationRegex = /(?:(\d+)(d(?:ays?)?|h(?:ours?|rs?)?|m(?:inutes?|ins?)?|mo(?:nths?)?|w(?:eeks?|ks?)?)(?: |$))/g;

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
					id: 'reason'
				},
				{
					id: 'time',
					match: 'option',
					flag: '--time'
				}
			],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS']
		});
	}
	async exec(
		message: BotMessage,
		{ user, reason, time }: { user: User; reason?: string; time?: string }
	): Promise<void> {
		const duration = moment.duration();
		let modlogEnry: Modlog;
		let banEntry: Ban;
		const translatedTime: string[] = [];
		try {
			try {
				if (time) {
					const parsed = [...time.matchAll(durationRegex)];
					if (parsed.length < 1) {
						await message.util.send('Invalid time.');
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
						moderator: message.author.id
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
						moderator: message.author.id
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
				await message.util.send(
					'Error saving to database. Please report this to a developer.'
				);
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
				await message.channel.send('Error sending message to user');
			}
			await message.guild.members.ban(user, {
				reason: `Banned by ${message.author.tag} with ${
					reason ? `reason ${reason}` : 'no reason'
				}`
			});
			await message.util.send(
				`Banned <@!${user.id}> ${
					translatedTime.length >= 1
						? `for ${translatedTime.join(', ')}`
						: 'permanently'
				} with reason \`${reason || 'No reason given'}\``
			);
		} catch {
			await message.util.send('Error banning :/');
			await modlogEnry.destroy();
			await banEntry.destroy();
			return;
		}
	}
}
