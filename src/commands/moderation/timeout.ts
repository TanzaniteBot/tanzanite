import {
	AllowedMentions,
	BotCommand,
	castDurationContent,
	emojis,
	formatTimeoutResponse,
	Moderation,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class TimeoutCommand extends BotCommand {
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
			clientPermissions: ['ModerateMembers'],
			userPermissions: ['ModerateMembers']
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
		const canModerateResponse = await Moderation.permissionCheck(
			message.member,
			member,
			Moderation.Action.Timeout,
			true,
			useForce
		);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.customTimeout({
			reason: content,
			moderator: message.member,
			duration: duration
		});

		return await message.util.reply({
			content: formatTimeoutResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
