import {
	AllowedMentions,
	BushCommand,
	castDurationContent,
	clientSendAndPermCheck,
	emojis,
	format,
	Moderation,
	timeoutResponse,
	type ArgType,
	type CommandMessage,
	type SlashMessage,
	type TimeoutResponse
} from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, PermissionFlagsBits, type GuildMember } from 'discord.js';

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
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the timeout.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be timed out and for how long?',
					retry: '{error} Choose a valid timeout reason and duration.',
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
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.ModerateMembers]),
			userPermissions: [PermissionFlagsBits.ModerateMembers]
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { user: ArgType<'user'>; reason_and_duration: ArgType<'contentWithDuration'> | string; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const { duration, content } = await castDurationContent(args.reason_and_duration, message);

		if (!duration) return await message.util.reply(`${emojis.error} You must specify a duration for timeouts.`);
		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, 'timeout', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.bushTimeout({
			reason: content,
			moderator: message.member,
			duration: duration
		});

		return await message.util.reply({
			content: TimeoutCommand.formatCode(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}

	public static formatCode(member: GuildMember, code: TimeoutResponse): string {
		const victim = format.input(member.user.tag);
		switch (code) {
			case timeoutResponse.MISSING_PERMISSIONS:
				return `${emojis.error} Could not timeout ${victim} because I am missing the **Timeout Members** permission.`;
			case timeoutResponse.INVALID_DURATION:
				return `${emojis.error} The duration you specified is too long, the longest you can timeout someone for is 28 days.`;
			case timeoutResponse.ACTION_ERROR:
				return `${emojis.error} An unknown error occurred while trying to timeout ${victim}.`;
			case timeoutResponse.MODLOG_ERROR:
				return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
			case timeoutResponse.DM_ERROR:
				return `${emojis.warn} Timed out ${victim} however I could not send them a dm.`;
			case timeoutResponse.SUCCESS:
				return `${emojis.success} Successfully timed out ${victim}.`;
			default:
				return `${emojis.error} An error occurred: ${format.input(code)}}`;
		}
	}
}
