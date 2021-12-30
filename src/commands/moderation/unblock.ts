import {
	AllowedMentions,
	BushCommand,
	BushTextChannel,
	BushThreadChannel,
	Moderation,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import assert from 'assert';

export default class UnblockCommand extends BushCommand {
	public constructor() {
		super('unblock', {
			aliases: ['unblock'],
			category: 'moderation',
			description: 'Allows a user to use a channel.',
			usage: ['unblock <member> [reason]'],
			examples: ['unblock IRONM00N 2h bad jokes'],
			args: [
				{
					id: 'user',
					description: 'The user to unblock.',
					type: 'user',
					prompt: 'What user would you like to unblock?',
					retry: '{error} Choose a valid user to unblock.',
					slashType: 'USER'
				},
				{
					id: 'reason',
					description: 'The reason and duration of the unblock.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be blocked and for how long?',
					retry: '{error} Choose a valid block reason and duration.',
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, 'MANAGE_CHANNELS'),
			userPermissions: (m) => util.userGuildPermCheck(m, ['MANAGE_MESSAGES'])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { user: ArgType<'user'>; reason: OptionalArgType<'string'>; force?: ArgType<'boolean'> }
	) {
		assert(message.inGuild());
		if (!(message.channel instanceof BushTextChannel || message.channel instanceof BushThreadChannel))
			return message.util.send(`${util.emojis.error} This command can only be used in text and thread channels.`);

		const member = await message.guild!.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${util.emojis.error} The user you selected is not in the server or is not a valid user.`);

		assert(message.member);
		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'unblock', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const parsedReason = args.reason ?? '';

		const responseCode = await member.unblock({
			reason: parsedReason,
			moderator: message.member,
			channel: message.channel
		});

		const responseMessage = () => {
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not unblock ${victim} because I am missing the **Manage Channel** permission.`;
				case 'invalid channel':
					return `${util.emojis.error} Could not unblock ${victim}, you can only unblock users in text or thread channels.`;
				case 'error unblocking':
					return `${util.emojis.error} An unknown error occurred while trying to unblock ${victim}.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error removing block entry':
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case 'failed to dm':
					return `${util.emojis.warn} Unblocked ${victim} however I could not send them a dm.`;
				case 'success':
					return `${util.emojis.success} Successfully unblocked ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
