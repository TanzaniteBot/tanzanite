import {
	AllowedMentions,
	formatUnmuteResponse,
	Moderation,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType } from 'discord.js';
import { BotCommand } from '../../../lib/extensions/discord-akairo/BotCommand.js';

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
		{ user, reason, force = false }: { user: ArgType<'user'>; reason: OptArgType<'string'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = message.guild.members.cache.get(user.id)!;

		const useForce = force && message.author.isOwner();
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

		const responseCode = await member.customUnmute({
			reason,
			moderator: message.member
		});

		return await message.util.reply({
			content: formatUnmuteResponse(member.client.utils.prefix(message), member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
