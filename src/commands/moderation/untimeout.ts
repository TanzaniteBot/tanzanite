import {
	AllowedMentions,
	BotCommand,
	Moderation,
	emojis,
	formatUntimeoutResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class UntimeoutCommand extends BotCommand {
	public constructor() {
		super('untimeout', {
			aliases: ['untimeout', 'remove-timeout'],
			category: 'moderation',
			description: 'Removes a timeout from a user.',
			usage: ['untimeout <user> [reason]'],
			examples: ['untimeout 1 2'],
			args: [
				{
					id: 'user',
					description: 'The user to remove a timeout from.',
					type: 'user',
					prompt: 'What user would you like to untimeout?',
					retry: '{error} Choose a valid user to untimeout.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for removing the timeout.',
					type: 'string',
					match: 'rest',
					prompt: 'Why should this user have their timeout removed?',
					retry: '{error} Choose a valid reason to remove the timeout.',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the untimeout.',
					only: 'slash',
					prompt: 'What evidence is there for the untimeout?',
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
		args: { user: ArgType<'user'>; reason: OptArgType<'string'>; evidence: SlashArgType<'attachment'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member != null);

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		if (!member.isCommunicationDisabled()) return message.util.reply(`${emojis.error} That user is not timed out.`);

		const useForce = args.force === true && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(
			message.member,
			member,
			Moderation.Action.Untimeout,
			true,
			useForce
		);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customRemoveTimeout({
			reason: args.reason ?? undefined,
			moderator: message.member,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatUntimeoutResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
