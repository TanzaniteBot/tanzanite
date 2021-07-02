import { Argument } from 'discord-akairo';
import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushGuildMember } from '../../lib/extensions/discord.js/BushGuildMember';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';
import { BushUser } from '../../lib/extensions/discord.js/BushUser';

export default class MuteCommand extends BushCommand {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'moderation',
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to mute?',
						retry: '{error} Choose a valid user to mute.'
					}
				},
				{
					id: 'reason',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: {
						start: 'Why would you like to mute this user?',
						retry: '{error} Choose a mute reason and duration.',
						optional: true
					}
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			userPermissions: ['MANAGE_MESSAGES'],
			description: {
				content: 'Mute a user.',
				usage: 'mute <member> <reason> [--time]',
				examples: ['mute @user bad boi --time 1h']
			},
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'The user to mute.',
					required: true
				},
				{
					type: 'STRING',
					name: 'reason',
					description: 'Why is the user is getting muted, and how long should they be muted for?',
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
	// 	const duration = moment.duration(time);
	// 	let modlogEnry: ModLog;
	// 	let muteEntry: Mute;
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
	// 		const muteRole = (await Guild.findByPk(message.guild.id)).get('muteRole');
	// 		try {
	// 			if (time) {
	// 				modlogEnry = ModLog.build({
	// 					user: user.id,
	// 					guild: message.guild.id,
	// 					reason,
	// 					type: ModLogType.TEMP_MUTE,
	// 					duration: duration.asMilliseconds(),
	// 					moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
	// 				});
	// 				muteEntry = Mute.build({
	// 					user: user.id,
	// 					guild: message.guild.id,
	// 					reason,
	// 					expires: new Date(new Date().getTime() + duration.asMilliseconds()),
	// 					modlog: modlogEnry.id
	// 				});
	// 			} else {
	// 				modlogEnry = ModLog.build({
	// 					user: user.id,
	// 					guild: message.guild.id,
	// 					reason,
	// 					type: ModLogType.MUTE,
	// 					moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
	// 				});
	// 				muteEntry = Mute.build({
	// 					user: user.id,
	// 					guild: message.guild.id,
	// 					reason,
	// 					modlog: modlogEnry.id
	// 				});
	// 			}
	// 			await modlogEnry.save();
	// 			await muteEntry.save();
	// 		} catch (e) {
	// 			this.client.console.error(`MuteCommand`, `Error saving to database. ${e?.stack}`);
	// 			yield `${this.client.util.emojis.error} Error saving to database. Please report this to a developer.`;
	// 			return;
	// 		}
	// 		try {
	// 			await user.send(
	// 				`You were muted in ${message.guild.name} ${time ? `for ${duration.humanize()}` : 'permanently'} with reason \`${
	// 					reason || 'No reason given'
	// 				}\``
	// 			);
	// 		} catch (e) {
	// 			yield `${this.client.util.emojis.warn} Unable to dm user`;
	// 		}
	// 		await (
	// 			await message.guild.members.fetch(user)
	// 		).roles.add(
	// 			muteRole,
	// 			`Muted by ${message instanceof CommandInteraction ? message.user.tag : message.author.tag} with ${
	// 				reason ? `reason ${reason}` : 'no reason'
	// 			}`
	// 		);
	// 		yield `${this.client.util.emojis.success} muted <@!${user.id}> ${
	// 			time ? `for ${duration.humanize()}` : 'permanently'
	// 		} with reason \`${reason || 'No reason given'}\``;
	// 	} catch {
	// 		yield `${this.client.util.emojis.error} Error muting :/`;
	// 		await muteEntry.destroy();
	// 		await modlogEnry.destroy();
	// 		return;
	// 	}
	// }
	async exec(
		message: BushMessage,
		{ user, reason }: { user: BushUser; reason?: { duration: number; contentWithoutTime: string } }
	): Promise<unknown> {
		return message.util.reply(`${this.client.util.emojis.error} This command is not finished.`);
		// this.client.console.debug(reason);

		// if (typeof time === 'string') {
		// 	time = (await Argument.cast('duration', this.client.commandHandler.resolver, message, time)) as number;
		// }
		// for await (const response of this.genResponses(message, user, reason.join(' '), time)) {
		// 	await message.util.sendNew(response);
		// }

		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		if (!this.client.util.moderatorCanModerateUser(message.member, member)) {
			return message.util.reply({
				content: `${this.client.util.emojis.error} You cannot mute **${member.user.tag}**.`
			});
		}

		const time =
			typeof reason === 'string'
				? //@ts-ignore: you are unreachable bitch
				  await Argument.cast('duration', this.client.commandHandler.resolver, message, reason)
				: reason.duration;
		const parsedReason = reason.contentWithoutTime;

		const response = await member.mute({
			reason: parsedReason,
			moderator: message.author,
			duration: time,
			createModLogEntry: true
		});

		switch (response) {
			case 'success':
				return message.util.reply(`${this.client.util.emojis.success} Successfully muted **${member.user.tag}**.`);
			case 'no mute role':
				return message.util.reply(
					`${this.client.util.emojis.error} Could not mute **${
						member.user.tag
					}**, you must set a mute role with ${message.guild.getSetting('prefix')}.`
				);
		}
	}
}
