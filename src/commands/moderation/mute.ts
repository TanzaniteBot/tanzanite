import { BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';
import { Argument } from 'discord-akairo';

export default class MuteCommand extends BushCommand {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'moderation',
			description: {
				content: 'Mute a user.',
				usage: 'mute <member> [reason] [duration]',
				examples: ['mute 322862723090219008 1 day commands in #general']
			},
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
						start: 'Why should this user be muted and for how long?',
						retry: '{error} Choose a valid mute reason and duration.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'What user would you like to mute?',
					required: true
				},
				{
					type: 'STRING',
					name: 'reason',
					description: 'Why should this user be muted and for how long?',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_MESSAGES']
		});
	}
	async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason }: { user: BushUser; reason?: { duration: number; contentWithoutTime: string } }
	): Promise<unknown> {
		const error = this.client.util.emojis.error;
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member, 'mute');
		const victimBoldTag = `**${member.user.tag}**`;

		if (typeof canModerateResponse !== 'boolean') {
			return message.util.reply(canModerateResponse);
		}

		let time: number;
		if (reason) {
			time =
				typeof reason === 'string'
					? await Argument.cast('duration', this.client.commandHandler.resolver, message as BushMessage, reason)
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
