import {
	AllowedMentions,
	Arg,
	BotCommand,
	formatUnbanResponse,
	type ArgType,
	type CommandMessage,
	type OptArgType,
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
		{ user, reason }: { user: ArgType<'user' | 'globalUser'>; reason: OptArgType<'string'> }
	) {
		assert(message.inGuild());

		const responseCode = await message.guild.customUnban({
			user,
			moderator: message.author,
			reason
		});

		return await message.util.reply({
			content: formatUnbanResponse(user, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}
}
