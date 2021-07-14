import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';
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
					name: 'user',
					description: 'What user would you like to mute?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be muted and for how long?',
					type: 'STRING',
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

		if (canModerateResponse !== true) {
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

		const responseCode = await member.mute({
			reason: parsedReason,
			moderator: message.author,
			duration: time
		});

		const responseMessage = () => {
			const prefix = message.guild.getSetting('prefix');
			switch (responseCode) {
				case 'missing permissions':
					return `${error} Could not mute ${victimBoldTag} because I am missing the \`Manage Roles\` permission.`;
				case 'no mute role':
					return `${error} Could not mute ${victimBoldTag}, you must set a mute role with \`${prefix}muterole\`.`;
				case 'invalid mute role':
					return `${error} Could not mute ${victimBoldTag} because the current mute role no longer exists. Please set a new mute role with \`${prefix}muterole\`.`;
				case 'mute role not manageable':
					return `${error} Could not mute ${victimBoldTag} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}muterole\`.`;
				case 'error giving mute role':
					return `${error} Could not mute ${victimBoldTag}, there was an error assigning them the mute role.`;
				case 'error creating modlog entry':
					return `${error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error creating mute entry':
					return `${error} There was an error creating a punishment entry, please report this to my developers.`;
				case 'failed to dm':
					return `${this.client.util.emojis.warn} Muted **${member.user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${this.client.util.emojis.success} Successfully muted **${member.user.tag}**.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
