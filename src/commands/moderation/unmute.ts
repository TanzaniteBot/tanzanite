import {
	AllowedMentions,
	Moderation,
	formatUnmuteResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { BotCommand } from '#lib/extensions/discord-akairo/BotCommand.js';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class UnmuteCommand extends BotCommand {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			category: 'moderation',
			description: 'unmute a user.',
			usage: ['unmute <member> [reason]'],
			examples: ['unmute 322862723090219008 you have been forgiven'],
			args: [
				{
					id: 'user',
					description: 'The user to unmute.',
					type: 'user',
					prompt: 'What user would you like to unmute?',
					retry: '{error} Choose a valid user to unmute.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the unmute.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be unmuted?',
					retry: '{error} Choose a valid unmute reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the unmute.',
					only: 'slash',
					prompt: 'What evidence is there for the unmute?',
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
		args: { user: ArgType<'user'>; reason: OptArgType<'string'>; evidence: SlashArgType<'attachment'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = message.guild.members.cache.get(args.user.id)!;

		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(
			message.member,
			member,
			Moderation.Action.Unmute,
			true,
			useForce
		);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customUnmute({
			reason: args.reason,
			moderator: message.member,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatUnmuteResponse(member.client.utils.prefix(message), member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
