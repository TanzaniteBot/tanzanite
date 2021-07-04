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
	async exec(
		message: BushMessage,
		{ user, reason }: { user: BushUser; reason?: { duration: number; contentWithoutTime: string } }
	): Promise<unknown> {
		const error = this.client.util.emojis.error;
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member);
		const victimBoldTag = `**${member.user.tag}**`;
		switch (canModerateResponse) {
			case 'moderator':
				return message.util.reply(`${error} You cannot mute ${victimBoldTag} because they are a moderator.`);
			case 'user hierarchy':
				return message.util.reply(
					`${error} You cannot mute ${victimBoldTag} because they have higher or equal role hierarchy as you do.`
				);
			case 'client hierarchy':
				return message.util.reply(
					`${error} You cannot mute ${victimBoldTag} because they have higher or equal role hierarchy as I do.`
				);
			case 'self':
				return message.util.reply(`${error} You cannot mute yourself.`);
		}

		let time;
		if (reason) {
			time =
				typeof reason === 'string'
					? await Argument.cast('duration', this.client.commandHandler.resolver, message, reason)
					: reason.duration;
		}
		const parsedReason = reason.contentWithoutTime;

		const response = await member.mute({
			reason: parsedReason,
			moderator: message.author,
			duration: time
		});

		switch (response) {
			case 'missing permissions':
				return message.util.reply(
					`${error} Could not mute ${victimBoldTag} because I am missing the \`Manage Roles\` permission.`
				);
			case 'no mute role':
				return message.util.reply(
					`${error} Could not mute ${victimBoldTag}, you must set a mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'invalid mute role':
				return message.util.reply(
					`${error} Could not mute ${victimBoldTag} because the current mute role no longer exists. Please set a new mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'mute role not manageable':
				return message.util.reply(
					`${error} Could not mute ${victimBoldTag} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'error giving mute role':
				return message.util.reply(`${error} Could not mute ${victimBoldTag}, there was an error assigning them the mute role.`);
			case 'error creating modlog entry':
				return message.util.reply(
					`${error} While muting ${victimBoldTag}, there was an error creating a modlog entry, please report this to my developers.`
				);
			case 'error creating mute entry':
				return message.util.reply(
					`${error} While muting ${victimBoldTag}, there was an error creating a mute entry, please report this to my developers.`
				);
			case 'failed to dm':
				return message.util.reply(
					`${this.client.util.emojis.warn} Muted **${member.user.tag}** however I could not send them a dm.`
				);
			case 'success':
				return message.util.reply(`${this.client.util.emojis.success} Successfully muted **${member.user.tag}**.`);
		}
	}
}
