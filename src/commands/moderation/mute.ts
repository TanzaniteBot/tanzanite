import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, BushUser, Moderation } from '@lib';

export default class MuteCommand extends BushCommand {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'moderation',
			description: {
				content: 'Mute a user.',
				usage: ['mute <member> [reason] [duration]'],
				examples: ['mute ironm00n 1 day commands in #general']
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_ROLES']),
			userPermissions: (m) => util.userGuildPermCheck(m, ['MANAGE_MESSAGES'])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { user: BushUser; reason?: { duration: number | null; contentWithoutTime: string } | string; force: boolean }
	) {
		const reason: { duration: number | null; contentWithoutTime: string } = args.reason
			? typeof args.reason === 'string'
				? await util.arg.cast('contentWithDuration', message, args.reason)
				: args.reason
			: { duration: null, contentWithoutTime: '' };

		if (reason.duration === null) reason.duration = 0;
		const member = await message.guild!.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(
				`${util.emojis.error} The user you selected is not in the server or is not a valid user.`
			);

		if (!message.member) throw new Error(`message.member is null`);
		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'mute', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const time = reason
			? typeof reason === 'string'
				? ((await util.arg.cast('duration', message, reason)) as number)
				: reason.duration
			: undefined;

		const parsedReason = reason?.contentWithoutTime ?? '';

		const responseCode = await member.mute({
			reason: parsedReason,
			moderator: message.member,
			duration: time ?? 0
		});

		const responseMessage = () => {
			const prefix = util.prefix(message);
			const victim = util.format.bold(member.user.tag);
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not mute ${victim} because I am missing the **Manage Roles** permission.`;
				case 'no mute role':
					return `${util.emojis.error} Could not mute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
				case 'invalid mute role':
					return `${util.emojis.error} Could not mute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
				case 'mute role not manageable':
					return `${util.emojis.error} Could not mute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
				case 'error giving mute role':
					return `${util.emojis.error} Could not mute ${victim}, there was an error assigning them the mute role.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error creating mute entry':
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Muted ${victim} however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully muted ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
