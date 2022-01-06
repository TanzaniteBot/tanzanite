import {
	AllowedMentions,
	BushCommand,
	Moderation,
	muteResponse,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import assert from 'assert';

export default class MuteCommand extends BushCommand {
	public constructor() {
		super('mute', {
			aliases: ['mute'],
			category: 'moderation',
			description: 'Mute a user.',
			usage: ['mute <member> [reasonAndDuration]'],
			examples: ['mute ironm00n 1 day commands in #general'],
			args: [
				{
					id: 'user',
					description: 'The user to mute.',
					type: 'user',
					prompt: 'What user would you like to mute?',
					retry: '{error} Choose a valid user to mute.',
					slashType: 'USER'
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the mute.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be muted and for how long?',
					retry: '{error} Choose a valid mute reason and duration.',
					optional: true,
					slashType: 'STRING'
				},
				{
					id: 'force',
					description: 'Override permission checks.',
					flag: '--force',
					match: 'flag',
					optional: true,
					slashType: false,
					only: 'text',
					ownerOnly: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_ROLES']),
			userPermissions: (m) => util.userGuildPermCheck(m, ['MANAGE_MESSAGES'])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			user: ArgType<'user'>;
			reason_and_duration: OptionalArgType<'contentWithDuration'> | string;
			force?: ArgType<'boolean'>;
		}
	) {
		const reason = args.reason_and_duration
			? typeof args.reason_and_duration === 'string'
				? await util.arg.cast('contentWithDuration', message, args.reason_and_duration)
				: args.reason_and_duration
			: { duration: null, contentWithoutTime: '' };

		if (reason.duration === null) reason.duration = 0;
		const member = await message.guild!.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${util.emojis.error} The user you selected is not in the server or is not a valid user.`);

		assert(message.member);
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

		const responseCode = await member.bushMute({
			reason: parsedReason,
			moderator: message.member,
			duration: time ?? 0
		});

		const responseMessage = (): string => {
			const prefix = util.prefix(message);
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case muteResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not mute ${victim} because I am missing the **Manage Roles** permission.`;
				case muteResponse.NO_MUTE_ROLE:
					return `${util.emojis.error} Could not mute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
				case muteResponse.MUTE_ROLE_INVALID:
					return `${util.emojis.error} Could not mute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
				case muteResponse.MUTE_ROLE_NOT_MANAGEABLE:
					return `${util.emojis.error} Could not mute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
				case muteResponse.ACTION_ERROR:
					return `${util.emojis.error} Could not mute ${victim}, there was an error assigning them the mute role.`;
				case muteResponse.MODLOG_ERROR:
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case muteResponse.PUNISHMENT_ENTRY_ADD_ERROR:
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case muteResponse.DM_ERROR:
					return `${util.emojis.warn} Muted ${victim} however I could not send them a dm.`;
				case muteResponse.SUCCESS:
					return `${util.emojis.success} Successfully muted ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
