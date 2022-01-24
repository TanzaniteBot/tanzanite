import {
	AllowedMentions,
	blockResponse,
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
import { ApplicationCommandOptionType, Permissions } from 'discord.js';

export default class BlockCommand extends BushCommand {
	public constructor() {
		super('block', {
			aliases: ['block'],
			category: 'moderation',
			description: 'Prevent a user from using a channel.',
			usage: ['block <member> [reasonAndDuration]'],
			examples: ['block IRONM00N 2h bad jokes'],
			args: [
				{
					id: 'user',
					description: 'The user to block.',
					type: 'user',
					prompt: 'What user would you like to block?',
					retry: '{error} Choose a valid user to block.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the block.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be blocked and for how long?',
					retry: '{error} Choose a valid block reason and duration.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [Permissions.FLAGS.MANAGE_CHANNELS]),
			userPermissions: (m) => util.userGuildPermCheck(m, [Permissions.FLAGS.MANAGE_MESSAGES])
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
		assert(message.inGuild());
		if (!(message.channel instanceof BushTextChannel || message.channel instanceof BushThreadChannel))
			return message.util.send(`${util.emojis.error} This command can only be used in text and thread channels.`);

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
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'block', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const time = reason
			? typeof reason === 'string'
				? ((await util.arg.cast('duration', message, reason)) as number)
				: reason.duration
			: undefined;

		const parsedReason = reason?.contentWithoutTime ?? '';

		const responseCode = await member.bushBlock({
			reason: parsedReason,
			moderator: message.member,
			duration: time ?? 0,
			channel: message.channel
		});

		const responseMessage = (): string => {
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case blockResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not block ${victim} because I am missing the **Manage Channel** permission.`;
				case blockResponse.INVALID_CHANNEL:
					return `${util.emojis.error} Could not block ${victim}, you can only block users in text or thread channels.`;
				case blockResponse.ACTION_ERROR:
					return `${util.emojis.error} An unknown error occurred while trying to block ${victim}.`;
				case blockResponse.MODLOG_ERROR:
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case blockResponse.PUNISHMENT_ENTRY_ADD_ERROR:
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case blockResponse.DM_ERROR:
					return `${util.emojis.warn} Blocked ${victim} however I could not send them a dm.`;
				case blockResponse.SUCCESS:
					return `${util.emojis.success} Successfully blocked ${victim}.`;
				default:
					return `${util.emojis.error} An error occurred: ${util.format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
