import {
	AllowedMentions,
	BotCommand,
	Moderation,
	castDurationContentWithSeparateSlash,
	emojis,
	formatBlockResponse,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class BlockCommand extends BotCommand {
	public constructor() {
		super('block', {
			aliases: ['block'],
			category: 'moderation',
			description: 'Prevent a user from using a channel.',
			usage: ['block <member> [reasonAndDuration]'],
			examples: ['block IRONM00N 2h bad jokes'],
			args: [
				{
					id: 'user',
					description: 'The user to block.',
					type: 'user',
					prompt: 'What user would you like to block?',
					retry: '{error} Choose a valid user to block.',
					slashType: ApplicationCommandOptionType.User
				},
				{
					id: 'reason_and_duration',
					description: 'The reason and duration of the block.',
					type: 'contentWithDuration',
					match: 'rest',
					prompt: 'Why should this user be blocked and for how long?',
					retry: '{error} Choose a valid block reason and duration.',
					optional: true,
					slashType: ApplicationCommandOptionType.String,
					only: 'text'
				},
				{
					id: 'reason',
					description: 'The reason for the block.',
					type: 'string',
					only: 'slash',
					prompt: 'Why should this user be blocked?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'duration',
					description: 'The duration of the block.',
					type: 'string',
					only: 'slash',
					prompt: 'How long would you like to block this user for?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the block.',
					only: 'slash',
					prompt: 'What evidence is there for the block?',
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
			userPermissions: ['ManageMessages'],
			lock: 'channel'
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
		assert(message.member != null);
		assert(message.channel);

		if (!message.channel.isTextBased())
			return message.util.send(`${emojis.error} This command can only be used in text based channels.`);

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
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Block, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await member.customBlock({
			reason: content,
			moderator: message.member,
			duration: duration,
			channel: message.channel,
			evidence: evidence
		});

		return await message.util.reply({
			content: formatBlockResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
