import {
	AllowedMentions,
	ArgType,
	BushCommand,
	Moderation,
	OptionalArgType,
	type BushGuildMember,
	type BushMessage,
	type BushSlashMessage
} from '#lib';

export default class UnmuteCommand extends BushCommand {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			category: 'moderation',
			description: 'unmute a user.',
			usage: ['unmute <member> [reason]'],
			examples: ['unmute 322862723090219008 1 day commands in #general'],
			args: [
				{
					id: 'user',
					description: 'The user to unmute.',
					type: 'user',
					prompt: 'What user would you like to unmute?',
					retry: '{error} Choose a valid user to unmute.',
					slashType: 'USER'
				},
				{
					id: 'reason',
					description: 'The reason for the unmute.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be unmuted?',
					retry: '{error} Choose a valid unmute reason.',
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
		{ user, reason, force }: { user: ArgType<'user'>; reason: OptionalArgType<'string'>; force: boolean }
	) {
		const error = util.emojis.error;
		const member = message.guild!.members.cache.get(user.id) as BushGuildMember;

		if (!message.member) throw new Error(`message.member is null`);

		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'unmute', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.unmute({
			reason,
			moderator: message.member
		});

		const responseMessage = () => {
			const prefix = util.prefix(message);
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case 'missing permissions':
					return `${error} Could not unmute ${victim} because I am missing the **Manage Roles** permission.`;
				case 'no mute role':
					return `${error} Could not unmute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
				case 'invalid mute role':
					return `${error} Could not unmute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
				case 'mute role not manageable':
					return `${error} Could not unmute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
				case 'error removing mute role':
					return `${error} Could not unmute ${victim}, there was an error removing their mute role.`;
				case 'error creating modlog entry':
					return `${error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case 'error removing mute entry':
					return `${error} While muting ${victim}, there was an error removing their mute entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} unmuted ${victim} however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully unmuted ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
