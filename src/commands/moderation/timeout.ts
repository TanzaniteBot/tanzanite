import {
	AllowedMentions,
	BushCommand,
	Moderation,
	timeoutResponse,
	type ArgType,
	type BushMessage,
	type BushSlashMessage
} from '#lib';
import assert from 'assert';

export default class TimeoutCommand extends BushCommand {
	public constructor() {
		super('timeout', {
			aliases: ['timeout', 'to'],
			category: 'moderation',
			description: 'Timeout a user.',
			usage: ['timeout <user> <reasonAndDuration>'],
			examples: ['timeout IRONM00N 2h'],
			args: [
				{
					id: 'user',
					description: 'The user to timeout.',
					type: 'user',
					prompt: 'What user would you like to timeout?',
					retry: '{error} Choose a valid user to timeout.',
					slashType: 'USER'
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the timeout.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be timed out and for how long?',
					retry: '{error} Choose a valid timeout reason and duration.',
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MODERATE_MEMBERS']),
			userPermissions: ['MODERATE_MEMBERS']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { user: ArgType<'user'>; reason_and_duration: ArgType<'contentWithDuration'> | string; force?: ArgType<'boolean'> }
	) {
		const reason = args.reason_and_duration
			? typeof args.reason_and_duration === 'string'
				? await util.arg.cast('contentWithDuration', message, args.reason_and_duration)
				: args.reason_and_duration
			: { duration: null, contentWithoutTime: '' };

		if (reason.duration === null || reason.duration < 1)
			return await message.util.reply(`${util.emojis.error} You must specify a duration for timeouts.`);
		const member = await message.guild!.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${util.emojis.error} The user you selected is not in the server or is not a valid user.`);

		assert(message.member);
		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'timeout', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const time = reason.duration;
		const parsedReason = reason.contentWithoutTime ?? '';

		const responseCode = await member.bushTimeout({
			reason: parsedReason,
			moderator: message.member,
			duration: time
		});

		const responseMessage = (): string => {
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case timeoutResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not timeout ${victim} because I am missing the **Timeout Members** permission.`;
				case timeoutResponse.INVALID_DURATION:
					return `${util.emojis.error} The duration you specified is too long, the longest you can timeout someone for is 28 days.`;
				case timeoutResponse.ACTION_ERROR:
					return `${util.emojis.error} An unknown error occurred while trying to timeout ${victim}.`;
				case timeoutResponse.MODLOG_ERROR:
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case timeoutResponse.DM_ERROR:
					return `${util.emojis.warn} Timed out ${victim} however I could not send them a dm.`;
				case timeoutResponse.SUCCESS:
					return `${util.emojis.success} Successfully timed out ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
