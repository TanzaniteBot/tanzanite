import {
	AllowedMentions,
	BotCommand,
	Moderation,
	emojis,
	formatKickResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class KickCommand extends BotCommand {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'moderation',
			description: 'Kick a user.',
			usage: ['kick <member> <reason>'],
			examples: ['kick @user bad'],
			args: [
				{
					id: 'user',
					description: 'The user to kick.',
					type: 'user',
					prompt: 'What user would you like to kick?',
					retry: '{error} Choose a valid user to kick.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the kick.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user be kicked?',
					retry: '{error} Choose a valid kick reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the kick.',
					only: 'slash',
					prompt: 'What evidence is there for the kick?',
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
			clientPermissions: ['KickMembers'],
			userPermissions: ['KickMembers']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			user: ArgType<'user'>;
			reason: OptArgType<'string'>;
			evidence: SlashArgType<'attachment'>;
			force: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = await message.guild.members.fetch(args.user.id);

		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);
		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Kick, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customKick({
			reason: args.reason,
			moderator: message.member,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatKickResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
