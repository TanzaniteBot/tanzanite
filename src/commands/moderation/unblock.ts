import {
	AllowedMentions,
	BotCommand,
	emojis,
	formatUnblockResponse,
	Moderation,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType } from 'discord.js';

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
		args: { user: ArgType<'user'>; reason: OptArgType<'string'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);
		assert(message.channel);

		if (!message.channel.isTextBased())
			return message.util.send(`${emojis.error} This command can only be used in text based channels.`);

		const member = await message.guild.members.fetch(args.user.id).catch(() => null);
		if (!member)
			return await message.util.reply(`${emojis.error} The user you selected is not in the server or is not a valid user.`);

		const useForce = args.force && message.author.isOwner();
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

		const responseCode = await member.customUnblock({
			reason: args.reason ?? '',
			moderator: message.member,
			channel: message.channel
		});

		return await message.util.reply({
			content: formatUnblockResponse(member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
