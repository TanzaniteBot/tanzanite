import {
	AllowedMentions,
	BotCommand,
	Moderation,
	emojis,
	formatWarnResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class WarnCommand extends BotCommand {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'moderation',
			description: 'Warn a user.',
			usage: ['warn <member> [reason]'],
			examples: ['warn @Tyman being cool'],
			args: [
				{
					id: 'user',
					description: 'The user to warn.',
					type: 'user',
					prompt: 'What user would you like to warn?',
					retry: '{error} Choose a valid user to warn.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the warn.',
					match: 'rest',
					prompt: 'Why should this user be warned?',
					retry: '{error} Choose a valid warn reason.',
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
			clientPermissions: [],
			userPermissions: ['ManageMessages']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { user: ArgType<'user'>; reason: OptArgType<'string'>; evidence: SlashArgType<'attachment'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member != null);

		const member = message.guild.members.cache.get(args.user.id);
		if (!member) return message.util.reply(`${emojis.error} I cannot warn users that are not in the server.`);
		const useForce = args.force === true && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Warn, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const { result: responseCode, caseNum } = await member.customWarn({
			reason: args.reason,
			moderator: message.member,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatWarnResponse(caseNum, member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
