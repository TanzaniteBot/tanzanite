import {
	AllowedMentions,
	Arg,
	BotCommand,
	emojis,
	format,
	unbanResponse,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage,
	type UnbanResponse
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, type User } from 'discord.js';

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
			content: UnbanCommand.formatCode(user, responseCode),
			allowedMentions: AllowedMentions.none()
		});
	}

	public static formatCode(user: User, code: UnbanResponse): string {
		const victim = format.input(user.tag);
		switch (code) {
			case unbanResponse.MISSING_PERMISSIONS:
				return `${emojis.error} Could not unban ${victim} because I am missing the **Ban Members** permission.`;
			case unbanResponse.ACTION_ERROR:
				return `${emojis.error} An error occurred while trying to unban ${victim}.`;
			case unbanResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
				return `${emojis.error} While unbanning ${victim}, there was an error removing their ban entry, please report this to my developers.`;
			case unbanResponse.MODLOG_ERROR:
				return `${emojis.error} While unbanning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
			case unbanResponse.NOT_BANNED:
				return `${emojis.warn} ${victim} is not banned but I tried to unban them anyways.`;
			case unbanResponse.DM_ERROR:
			case unbanResponse.SUCCESS:
				return `${emojis.success} Successfully unbanned ${victim}.`;
			default:
				return `${emojis.error} An error occurred: ${format.input(code)}}`;
		}
	}
}
