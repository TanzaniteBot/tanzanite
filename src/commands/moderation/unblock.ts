import {
	AllowedMentions,
	BushCommand,
	Moderation,
	unblockResponse,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default class UnblockCommand extends BushCommand {
	public constructor() {
		super('unblock', {
			aliases: ['unblock'],
			category: 'moderation',
			description: 'Allows a user to use a channel.',
			usage: ['unblock <member> [reason]'],
			examples: ['unblock IRONM00N nvm your jokes are funny'],
			args: [
				{
					id: 'user',
					description: 'The user to unblock.',
					type: 'user',
					prompt: 'What user would you like to unblock?',
					retry: '{error} Choose a valid user to unblock.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason and duration of the unblock.',
					type: 'string',
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
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageChannels]),
			userPermissions: (m) => util.userGuildPermCheck(m, [PermissionFlagsBits.ManageMessages])
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { user: ArgType<'user'>; reason: OptionalArgType<'string'>; force?: ArgType<'boolean'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		if (!message.channel.isTextBased())
			return message.util.send(`${util.emojis.error} This command can only be used in text based channels.`);

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${util.emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'unblock', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.bushUnblock({
			reason: args.reason ?? '',
			moderator: message.member,
			channel: message.channel
		});

		const responseMessage = (): string => {
			const victim = util.format.input(member.user.tag);
			switch (responseCode) {
				case unblockResponse.MISSING_PERMISSIONS:
					return `${util.emojis.error} Could not unblock ${victim} because I am missing the **Manage Channel** permission.`;
				case unblockResponse.INVALID_CHANNEL:
					return `${util.emojis.error} Could not unblock ${victim}, you can only unblock users in text or thread channels.`;
				case unblockResponse.ACTION_ERROR:
					return `${util.emojis.error} An unknown error occurred while trying to unblock ${victim}.`;
				case unblockResponse.MODLOG_ERROR:
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case unblockResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
					return `${util.emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
				case unblockResponse.DM_ERROR:
					return `${util.emojis.warn} Unblocked ${victim} however I could not send them a dm.`;
				case unblockResponse.SUCCESS:
					return `${util.emojis.success} Successfully unblocked ${victim}.`;
				default:
					return `${util.emojis.error} An error occurred: ${util.format.input(responseCode)}}`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
