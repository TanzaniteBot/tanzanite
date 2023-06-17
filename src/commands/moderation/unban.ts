import {
	AllowedMentions,
	Arg,
	BotCommand,
	formatUnbanResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class UnbanCommand extends BotCommand {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'moderation',
			description: 'Unban a member from the server.',
			usage: ['unban <member> <reason>'],
			examples: ['unban 322862723090219008 I changed my mind, commands are allowed in #general'],
			args: [
				{
					id: 'user',
					description: 'The user to unban.',
					type: Arg.union('user', 'globalUser'),
					prompt: 'What user would you like to unban?',
					retry: '{error} Choose a valid user to unban.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason',
					description: 'The reason for the unban',
					type: 'string',
					match: 'restContent',
					prompt: 'Why should this user be unbanned?',
					retry: '{error} Choose a valid unban reason.',
					optional: true,
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the unban.',
					only: 'slash',
					prompt: 'What evidence is there for the unban?',
					slashType: ApplicationCommandOptionType.Attachment,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['BanMembers'],
			userPermissions: ['BanMembers']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { user: ArgType<'user' | 'globalUser'>; reason: OptArgType<'string'>; evidence: SlashArgType<'attachment'> }
	) {
		assert(message.inGuild());

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await message.guild.customUnban({
			user: args.user,
			moderator: message.author,
			reason: args.reason,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatUnbanResponse(args.user, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
