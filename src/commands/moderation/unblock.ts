import {
	AllowedMentions,
	BotCommand,
	Moderation,
	emojis,
	formatUnblockResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class UnblockCommand extends BotCommand {
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
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the unblock.',
					only: 'slash',
					prompt: 'What evidence is there for the unblock?',
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
			clientPermissions: ['ManageChannels'],
			userPermissions: ['ManageMessages']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { user: ArgType<'user'>; reason: OptArgType<'string'>; evidence: SlashArgType<'attachment'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member != null);
		assert(message.channel);

		if (!message.channel.isTextBased())
			return message.util.send(`${emojis.error} This command can only be used in text based channels.`);

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force === true && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(
			message.member,
			member,
			Moderation.Action.Unblock,
			true,
			useForce
		);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customUnblock({
			reason: args.reason ?? '',
			moderator: message.member,
			channel: message.channel,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatUnblockResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
