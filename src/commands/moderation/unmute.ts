import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';
import { Moderation } from '../../lib/common/moderation';

export default class UnmuteCommand extends BushCommand {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			category: 'moderation',
			description: {
				content: 'unmute a user.',
				usage: 'unmute <member> [reason]',
				examples: ['unmute 322862723090219008 1 day commands in #general']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to unmute?',
						retry: '{error} Choose a valid user to unmute.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'Why should this user be unmuted?',
						retry: '{error} Choose a valid unmute reason.',
						optional: true
					}
				},
				{
					id: 'force',
					flag: '--force',
					match: 'flag'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to unmute?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be unmuted?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason, force }: { user: BushUser; reason?: string; force: boolean }
	): Promise<unknown> {
		const error = util.emojis.error;
		const member = message.guild!.members.cache.get(user.id) as BushGuildMember;

		if (!message.member) throw new Error(`message.member is null`);

		const useForce = force && message.author.isOwner();

		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'unmute', true, useForce);

		const victimBoldTag = `**${member.user.tag}**`;

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.unmute({
			reason,
			moderator: message.member
		});

		const responseMessage = async () => {
			const prefix = await message.guild!.getSetting('prefix');
			switch (responseCode) {
				case 'missing permissions':
					return `${error} Could not unmute ${victimBoldTag} because I am missing the \`Manage Roles\` permission.`;
				case 'no mute role':
					return `${error} Could not unmute ${victimBoldTag}, you must set a mute role with \`${prefix}muterole\`.`;
				case 'invalid mute role':
					return `${error} Could not unmute ${victimBoldTag} because the current mute role no longer exists. Please set a new mute role with \`${prefix}muterole\`.`;
				case 'mute role not manageable':
					return `${error} Could not unmute ${victimBoldTag} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}muterole\`.`;
				case 'error removing mute role':
					return `${error} Could not unmute ${victimBoldTag}, there was an error removing their mute role.`;
				case 'error creating modlog entry':
					return `${error} While muting ${victimBoldTag}, there was an error creating a modlog entry, please report this to my developers.`;
				case 'error removing mute entry':
					return `${error} While muting ${victimBoldTag}, there was an error removing their mute entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} unmuted **${member.user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully unmuted **${member.user.tag}**.`;
			}
		};
		return await message.util.reply({ content: await responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
