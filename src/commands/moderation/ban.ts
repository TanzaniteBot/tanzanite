import { Message, User } from 'discord.js';
import { BushCommand } from '../../lib';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'moderation',
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to ban?',
						retry: '{error} Choose a valid user to ban.'
					}
				},
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'restContent',
					prompt: {
						start: 'Why would you like to ban this user?',
						retry: '{error} Choose a ban reason.',
						optional: true
					}
				}
			],
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			description: {
				content: 'Ban a member from the server.',
				usage: 'ban <member> <reason> [--time]',
				examples: ['ban @user bad --time 69d']
			},
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'Who would you like to ban?',
					required: true
				},
				{
					type: 'STRING',
					name: 'reason',
					description: 'Why are they getting banned?',
					required: false
				}
			],
			slash: true
		});
	}
	// async *genResponses(
	// 	message: Message | CommandInteraction,
	// 	user: User,
	// 	reason?: string,
	// 	time?: number
	// ): AsyncIterable<string> {
	// 	const duration = moment.duration();
	// 	let modLogEntry: ModLog;
	// 	let banEntry: Ban;
	// 	// const translatedTime: string[] = [];
	// 	// Create guild entry so postgres doesn't get mad when I try and add a modlog entry
	// 	await Guild.findOrCreate({
	// 		where: {
	// 			id: message.guild.id
	// 		},
	// 		defaults: {
	// 			id: message.guild.id
	// 		}
	// 	});
	// 	try {
	// 		if (time) {
	// 			duration.add(time);
	// 			/* 	const parsed = [...time.matchAll(durationRegex)];
	// 				if (parsed.length < 1) {
	// 					yield `${this.client.util.emojis.error} Invalid time.`;
	// 					return;
	// 				}
	// 				for (const part of parsed) {
	// 					const translated = Object.keys(durationAliases).find((k) => durationAliases[k].includes(part[2]));
	// 					translatedTime.push(part[1] + ' ' + translated);
	// 					duration.add(Number(part[1]), translated as 'weeks' | 'days' | 'hours' | 'months' | 'minutes');
	// 				} */
	// 			modLogEntry = ModLog.build({
	// 				user: user.id,
	// 				guild: message.guild.id,
	// 				reason,
	// 				type: ModLogType.TEMP_BAN,
	// 				duration: duration.asMilliseconds(),
	// 				moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
	// 			});
	// 			banEntry = Ban.build({
	// 				user: user.id,
	// 				guild: message.guild.id,
	// 				reason,
	// 				expires: new Date(new Date().getTime() + duration.asMilliseconds()),
	// 				modlog: modLogEntry.id
	// 			});
	// 		} else {
	// 			modLogEntry = ModLog.build({
	// 				user: user.id,
	// 				guild: message.guild.id,
	// 				reason,
	// 				type: ModLogType.BAN,
	// 				moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
	// 			});
	// 			banEntry = Ban.build({
	// 				user: user.id,
	// 				guild: message.guild.id,
	// 				reason,
	// 				modlog: modLogEntry.id
	// 			});
	// 		}
	// 		await modLogEntry.save();
	// 		await banEntry.save();

	// 		try {
	// 			await user.send(
	// 				`You were banned in ${message.guild.name} ${duration ? duration.humanize() : 'permanently'} with reason \`${
	// 					reason || 'No reason given'
	// 				}\``
	// 			);
	// 		} catch {
	// 			yield `${this.client.util.emojis.warn} Unable to dm user`;
	// 		}
	// 		await message.guild.members.ban(user, {
	// 			reason: `Banned by ${message instanceof CommandInteraction ? message.user.tag : message.author.tag} with ${
	// 				reason ? `reason ${reason}` : 'no reason'
	// 			}`
	// 		});
	// 		yield `${this.client.util.emojis.success} Banned <@!${user.id}> ${
	// 			duration ? duration.humanize() : 'permanently'
	// 		} with reason \`${reason || 'No reason given'}\``;
	// 	} catch {
	// 		yield `${this.client.util.emojis.error} Error banning :/`;
	// 		await banEntry.destroy();
	// 		await modLogEntry.destroy();
	// 		return;
	// 	}
	// }
	async exec(
		message: Message,
		{ user, reason, time }: { user: User; reason?: string; time?: number | string }
	): Promise<unknown> {
		return message.util.reply(`${this.client.util.emojis.error} This command is not finished.`);

		// if (typeof time === 'string') {
		// 	time = (await Argument.cast('duration', this.client.commandHandler.resolver, message, time)) as number;
		// 	//// time = this.client.commandHandler.resolver.type('duration')
		// }
		// for await (const response of this.genResponses(message, user, reason, time)) {
		// 	await message.util.send(response);
		// }
	}
}
