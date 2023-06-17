import {
	AllowedMentions,
	BotCommand,
	Moderation,
	castDurationContentWithSeparateSlash,
	emojis,
	formatTimeoutResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
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
					slashType: ApplicationCommandOptionType.String,
					only: 'text'
				},
				{
					id: 'reason',
					description: 'The reason for the ban.',
					type: 'string',
					only: 'slash',
					prompt: 'Why should this user be banned?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'duration',
					description: 'The duration of the ban.',
					type: 'string',
					only: 'slash',
					prompt: 'How long would you like to ban this user for?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the ban.',
					only: 'slash',
					prompt: 'What evidence is there for the ban?',
					slashType: ApplicationCommandOptionType.Attachment,
					optional: true
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
		args: {
			user: ArgType<'user'>;
			reason_and_duration: OptArgType<'contentWithDuration'>;
			reason: OptArgType<'string'>;
			duration: OptArgType<'string'>;
			evidence: SlashArgType<'attachment'>;
			force?: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());
		assert(message.member);

		const { duration, content } = await castDurationContentWithSeparateSlash(
			args.reason_and_duration,
			args.reason,
			args.duration,
			message
		);

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

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customTimeout({
			reason: content,
			moderator: message.member,
			duration: duration,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatTimeoutResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
