import {
	AllowedMentions,
	blockResponse,
	BotCommand,
	castDurationContent,
	emojis,
	format,
	Moderation,
	type ArgType,
	type BlockResponse,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, type GuildMember } from 'discord.js';

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
			clientPermissions: ['ManageChannels'],
			userPermissions: ['ManageMessages'],
			lock: 'channel'
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			user: ArgType<'user'>;
			reason_and_duration: OptArgType<'contentWithDuration'> | string;
			force: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());
		assert(message.member);
		assert(message.channel);

		if (!message.channel.isTextBased())
			return message.util.send(`${emojis.error} This command can only be used in text based channels.`);

		const { duration, content } = await castDurationContent(args.reason_and_duration, message);

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Block, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.customBlock({
			reason: content,
			moderator: message.member,
			duration: duration,
			channel: message.channel
		});

		return await message.util.reply({
			content: BlockCommand.formatCode(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}

	public static formatCode(member: GuildMember, code: BlockResponse): string {
		const victim = format.input(member.user.tag);
		switch (code) {
			case blockResponse.MISSING_PERMISSIONS:
				return `${emojis.error} Could not block ${victim} because I am missing the **Manage Channel** permission.`;
			case blockResponse.INVALID_CHANNEL:
				return `${emojis.error} Could not block ${victim}, you can only block users in text or thread channels.`;
			case blockResponse.ACTION_ERROR:
				return `${emojis.error} An unknown error occurred while trying to block ${victim}.`;
			case blockResponse.MODLOG_ERROR:
				return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
			case blockResponse.PUNISHMENT_ENTRY_ADD_ERROR:
				return `${emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
			case blockResponse.DM_ERROR:
				return `${emojis.warn} Blocked ${victim} however I could not send them a dm.`;
			case blockResponse.SUCCESS:
				return `${emojis.success} Successfully blocked ${victim}.`;
			default:
				return `${emojis.error} An error occurred: ${format.input(code)}}`;
		}
	}
}
