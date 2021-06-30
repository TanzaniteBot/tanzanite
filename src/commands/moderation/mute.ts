import { Argument } from 'discord-akairo';
import { CommandInteraction, Message, User } from 'discord.js';
import moment from 'moment';
import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { Guild, ModLog, ModLogType, Mute } from '../../lib/models';

export default class MuteCommand extends BushCommand {
	constructor() {
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
					match: 'separate',
					prompt: {
						start: 'Why would you like to mute this user?',
						retry: '{error} Choose a mute reason.',
						optional: true
					}
				},
				{
					id: 'time',
					type: 'duration',
					match: 'option',
					flag: '--time'
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
					description: 'Why the user is getting muted.',
					required: false
				},
				{
					type: 'STRING',
					name: 'time',
					description: 'How long the user should be muted for.',
					required: false
				}
			],
			slash: true
		});
	}
	async *genResponses(
		message: Message | CommandInteraction,
		user: User,
		reason?: string,
		time?: number
	): AsyncIterable<string> {
		const duration = moment.duration(time);
		let modlogEnry: ModLog;
		let muteEntry: Mute;
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
			const muteRole = (await Guild.findByPk(message.guild.id)).get('muteRole');
			try {
				if (time) {
					modlogEnry = ModLog.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						type: ModLogType.TEMP_MUTE,
						duration: duration.asMilliseconds(),
						moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
					});
					muteEntry = Mute.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						expires: new Date(new Date().getTime() + duration.asMilliseconds()),
						modlog: modlogEnry.id
					});
				} else {
					modlogEnry = ModLog.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						type: ModLogType.MUTE,
						moderator: message instanceof CommandInteraction ? message.user.id : message.author.id
					});
					muteEntry = Mute.build({
						user: user.id,
						guild: message.guild.id,
						reason,
						modlog: modlogEnry.id
					});
				}
				await modlogEnry.save();
				await muteEntry.save();
			} catch (e) {
				this.client.console.error(`MuteCommand`, `Error saving to database. ${e?.stack}`);
				yield `${this.client.util.emojis.error} Error saving to database. Please report this to a developer.`;
				return;
			}
			try {
				await user.send(
					`You were muted in ${message.guild.name} ${time ? `for ${duration.humanize()}` : 'permanently'} with reason \`${
						reason || 'No reason given'
					}\``
				);
			} catch (e) {
				yield `${this.client.util.emojis.warn} Unable to dm user`;
			}
			await (
				await message.guild.members.fetch(user)
			).roles.add(
				muteRole,
				`Muted by ${message instanceof CommandInteraction ? message.user.tag : message.author.tag} with ${
					reason ? `reason ${reason}` : 'no reason'
				}`
			);
			yield `${this.client.util.emojis.success} muted <@!${user.id}> ${
				time ? `for ${duration.humanize()}` : 'permanently'
			} with reason \`${reason || 'No reason given'}\``;
		} catch {
			yield `${this.client.util.emojis.error} Error muting :/`;
			await muteEntry.destroy();
			await modlogEnry.destroy();
			return;
		}
	}
	async exec(
		message: Message,
		{ user, reason, time }: { user: User; reason?: string[]; time?: string | number }
	): Promise<void> {
		this.client.console.debug(reason);

		if (typeof time === 'string') {
			time = (await Argument.cast('duration', this.client.commandHandler.resolver, message, time)) as number;
		}
		for await (const response of this.genResponses(message, user, reason.join(' '), time)) {
			await message.util.sendNew(response);
		}
	}
}
