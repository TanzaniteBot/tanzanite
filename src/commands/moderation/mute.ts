import {
	AllowedMentions,
	BotCommand,
	Moderation,
	castDurationContentWithSeparateSlash,
	emojis,
	formatMuteResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class MuteCommand extends BotCommand {
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
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the mute.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be muted and for how long?',
					retry: '{error} Choose a valid mute reason and duration.',
					optional: true,
					slashType: ApplicationCommandOptionType.String,
					only: 'text'
				},
				{
					id: 'reason',
					description: 'The reason for the mute.',
					type: 'string',
					only: 'slash',
					prompt: 'Why should this user be muted?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'duration',
					description: 'The duration of the mute.',
					type: 'string',
					only: 'slash',
					prompt: 'How long would you like to mute this user for?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the mute.',
					only: 'slash',
					prompt: 'What evidence is there for the mute?',
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
			clientPermissions: ['ManageRoles'],
			userPermissions: ['ManageMessages']
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
			force: ArgType<'flag'>;
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

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Mute, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customMute({
			reason: content,
			moderator: message.member,
			duration: duration,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatMuteResponse(this.client.utils.prefix(message), member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
