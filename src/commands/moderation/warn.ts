import {
	AllowedMentions,
	BotCommand,
	emojis,
	formatWarnResponse,
	Moderation,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType } from 'discord.js';

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
		{ user, reason, force = false }: { user: ArgType<'user'>; reason: OptArgType<'string'>; force?: ArgType<'flag'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		const member = message.guild.members.cache.get(user.id);
		if (!member) return message.util.reply(`${emojis.error} I cannot warn users that are not in the server.`);
		const useForce = force && message.author.isOwner();
		const canModerateResponse = await Moderation.permissionCheck(message.member, member, Moderation.Action.Warn, true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const { result: responseCode, caseNum } = await member.customWarn({
			reason,
			moderator: message.member
		});

		return await message.util.reply({
			content: formatWarnResponse(caseNum, member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
